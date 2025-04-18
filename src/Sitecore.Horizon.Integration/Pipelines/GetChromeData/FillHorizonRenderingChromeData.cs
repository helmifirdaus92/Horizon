// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.IdentityModel.Protocols.WSTrust;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Layouts;
using Sitecore.LayoutService.Personalization.Rules.Conditions;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Pipelines.ResolveRenderingDatasource;
using Sitecore.Rules;
using Sitecore.Rules.Actions;
using Sitecore.Rules.ConditionalRenderings;
using Sitecore.Rules.Conditions;
using Sitecore.Shell.Framework.Commands;
using Sitecore.Sites.Headless;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Pipelines.GetChromeData
{
    internal class FillHorizonRenderingChromeData : GetRenderingChromeData
    {
        private readonly IHorizonInternalContext _horizonContext;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly BaseCorePipelineManager _pipelineManager;
        private readonly ISitecoreContext _sitecoreContext;

        public FillHorizonRenderingChromeData(IHorizonInternalContext horizonContext, IHorizonItemHelper itemHelper,
            BaseClient client, BaseCorePipelineManager pipelineManager, ISitecoreContext sitecoreContext): base(client)
        {
            _horizonContext = horizonContext;
            _itemHelper = itemHelper;
            _pipelineManager = pipelineManager;
            _sitecoreContext = sitecoreContext;
        }

        public override void Process(GetChromeDataArgs args)
        {
            if (_horizonContext.GetHeadlessMode() != HeadlessMode.Edit)
            {
                base.Process(args);
                return;
            }

            Assert.ArgumentNotNull(args, nameof(args));

            if (args.ChromeType != ChromeType)
            {
                return;
            }

            var renderingReference = args.CustomData[RenderingReferenceKey] as RenderingReference;
            if (renderingReference == null)
            {
                return;
            }

            SetRenderingIDsToCommandContext(args.CommandContext, renderingReference);
            var isEditable = renderingReference.RenderingItem?.Editable == true && args.Item.Access.CanWrite() && args.Item.Access.CanWriteLanguage();
            args.ChromeData.Custom["editable"] = $"{isEditable}".ToUpperInvariant();
            args.ChromeData.Custom["renderingId"] = renderingReference.RenderingID;
            args.ChromeData.Custom["renderingInstanceId"] = renderingReference.UniqueId;
            args.ChromeData.Custom["compatibleRenderings"] = renderingReference.RenderingItem?.InnerItem.Fields["Compatible Renderings"].Value?.Split('|');
            args.ChromeData.Custom["contextItem"] = new HorizonChromeDataItem(args.Item);

            args.SetChromeDisplayName(renderingReference.WebEditDisplayName);
            var renderingItemShortDescription = renderingReference.RenderingItem?.InnerItem.Appearance.ShortDescription;
            if (!string.IsNullOrEmpty(renderingItemShortDescription))
            {
                args.SetExpandedDisplayNameToChromeData(renderingItemShortDescription);
            }

            PopulateFEaaSRenderingData(args, renderingReference.RenderingItem?.InnerItem, renderingReference.Settings.Parameters);

            PopulatePersonalizationActionsData(args, renderingReference);
        }

        private static void SetRenderingIDsToCommandContext(CommandContext commandContext, RenderingReference renderingReference)
        {
            if (commandContext == null)
            {
                return;
            }

            if (!ID.IsNullOrEmpty(renderingReference.RenderingID))
            {
                commandContext.Parameters.Add("renderingId", renderingReference.RenderingID.ToString());
            }

            if (!string.IsNullOrEmpty(renderingReference.UniqueId))
            {
                commandContext.Parameters.Add("referenceId", renderingReference.UniqueId);
            }
        }

        private void PopulatePersonalizationActionsData(GetChromeDataArgs args, RenderingReference renderingReference)
        {
            var actions = GetAppliedRuleActions(renderingReference);
            args.ChromeData.Custom["appliedPersonalizationActions"] = actions.Select(action =>
            {
                var name = action.GetType().Name;
                return name.Remove(name.IndexOf('`'));
            });

            if (!actions.Any())
            {
                return;
            }

            // set datasource
            var setDataSourceAction = actions.FirstOrDefault(action => action.GetType() == typeof(SetDataSourceAction<ConditionalRenderingsRuleContext>))
                as SetDataSourceAction<ConditionalRenderingsRuleContext>;
            if (setDataSourceAction != null)
            {
                bool dataSourceIsGuid = Guid.TryParse(setDataSourceAction.DataSource, out _);
                if (!dataSourceIsGuid)
                {
                    var resolveDatasourceArgs = new ResolveRenderingDatasourceArgs(setDataSourceAction.DataSource);
                    resolveDatasourceArgs.CustomData.Add("contextItem", _sitecoreContext.Item);
                    _pipelineManager.Platform().ResolveRenderingDataSource(resolveDatasourceArgs);
                    setDataSourceAction.DataSource = resolveDatasourceArgs.Datasource;
                }

                var dataSourceItem = _itemHelper.GetItem(setDataSourceAction.DataSource, ItemScope.AnyNonSystem);
                if(dataSourceItem != null)
                {
                    args.ChromeData.Custom["contextItem"] = new HorizonChromeDataItem(dataSourceItem);
                }
            }

            // set rendering
            Data.Items.Item? replacedRenderingItem = null;
            var setRenderingAction = actions.FirstOrDefault(action => action.GetType() == typeof(SetRenderingAction<ConditionalRenderingsRuleContext>))
                as SetRenderingAction<ConditionalRenderingsRuleContext>;
            if (setRenderingAction != null)
            {
                replacedRenderingItem = _itemHelper.GetItem(setRenderingAction.RenderingItem, ItemScope.AnyNonSystem);
                if (replacedRenderingItem != null)
                {
                    args.ChromeData.Custom["renderingId"] = replacedRenderingItem.ID;
                    args.SetChromeDisplayName(replacedRenderingItem.DisplayName);
                }
            }

            // set parameters
            var setParametersAction = actions.FirstOrDefault(action => action.GetType() == typeof(SetParametersAction<ConditionalRenderingsRuleContext>))
               as SetParametersAction<ConditionalRenderingsRuleContext>;
            if (setParametersAction != null)
            {
                var renderingItem = replacedRenderingItem ?? renderingReference.RenderingItem?.InnerItem;                              
                PopulateFEaaSRenderingData(args, renderingItem, setParametersAction.Parameters);
            }
        }

        private static IEnumerable<RuleAction<ConditionalRenderingsRuleContext>> GetAppliedRuleActions(RenderingReference renderingReference)
        {
            string variantFromUrl = WebUtil.GetQueryString("sc_variant", null);
            foreach (Rule<ConditionalRenderingsRuleContext> rule in renderingReference.Settings.Rules.Rules)
            {
                if(variantFromUrl != null)
                {
                    if (rule.Condition is VisitorAudienceFilterCondition<ConditionalRenderingsRuleContext> cond
                                        && cond.VariantName.Equals(variantFromUrl, StringComparison.OrdinalIgnoreCase))
                    {
                        return rule.Actions;
                    }
                }
                else
                {
                    if(rule.Condition is TrueCondition<ConditionalRenderingsRuleContext>)
                    {
                        return rule.Actions;
                    }
                }
                
            }

            return new List<RuleAction<ConditionalRenderingsRuleContext>>();
        }

        private void PopulateFEaaSRenderingData(GetChromeDataArgs args, Data.Items.Item? renderingItem, string renderingParameters)
        {
            if(renderingItem == null)
            {
                return;
            }

            if (!_itemHelper.IsFeaasRendering(renderingItem) && !_itemHelper.IsByocRendering(renderingItem))
            {
                return;
            }

            var parameters = WebUtil.ParseUrlParameters(renderingParameters);
            var fEaasComponentName = !string.IsNullOrWhiteSpace(parameters["ComponentLabel"]) ? parameters["ComponentLabel"] : parameters["ComponentName"];
            args.SetChromeDisplayName(fEaasComponentName);
        }
    }
}
