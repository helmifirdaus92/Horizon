// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Presentation.Models.Personalization;
using Sitecore.Layouts;
using Sitecore.Mvc.Extensions;
using Sitecore.Rules;
using Sitecore.Text;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Presentation.Mapper
{
    internal class PresentationDetailsMapper : IPresentationDetailsMapper
    {
        public LayoutDefinition MapPresentationDetails(PresentationDetails presentationDetails)
        {
            Assert.ArgumentNotNull(presentationDetails, nameof(presentationDetails));

            var deviceDefinitionList = new ArrayList();
            foreach (var device in presentationDetails.Devices)
            {
                deviceDefinitionList.Add(new DeviceDefinition
                {
                    ID = device.Id.ToGuidString(),
                    Layout = device.LayoutId.ToGuidString(),
                    Placeholders = GetPlaceholdersDefinitions(device),
                    Renderings = GetRenderingsDefinitions(device),
                });
            }

            return new LayoutDefinition
            {
                Devices = deviceDefinitionList,
            };
        }

        private static ArrayList GetPlaceholdersDefinitions(DeviceModel deviceModel)
        {
            var placeholders = new ArrayList();
            foreach (var placeholder in deviceModel.Placeholders)
            {
                placeholders.Add(new PlaceholderDefinition
                {
                    UniqueId = placeholder.InstanceId.ToGuidString(),
                    Key = placeholder.Key,
                    MetaDataItemId = placeholder.MetadataId.ToGuidString(),
                });
            }

            return placeholders;
        }

        private static ArrayList GetRenderingsDefinitions(DeviceModel deviceModel)
        {
            var renderings = new ArrayList();
            foreach (var rendering in deviceModel.Renderings)
            {
                renderings.Add(new RenderingDefinition
                {
                    UniqueId = rendering.InstanceId.ToGuidString(),
                    Placeholder = rendering.PlaceholderKey,
                    ItemID = rendering.Id.ToGuidString(),
                    Datasource = rendering.DataSource,
                    Cachable = rendering.Caching?.Cacheable?.ToBoolString(),
                    VaryByData = rendering.Caching?.VaryByData?.ToBoolString(),
                    VaryByDevice = rendering.Caching?.VaryByDevice?.ToBoolString(),
                    VaryByQueryString = rendering.Caching?.VaryByQueryString?.ToBoolString(),
                    VaryByParameters = rendering.Caching?.VaryByParameters?.ToBoolString(),
                    VaryByLogin = rendering.Caching?.VaryByLogin?.ToBoolString(),
                    VaryByUser = rendering.Caching?.VaryByUser?.ToBoolString(),
                    ClearOnIndexUpdate = rendering.Caching?.ClearOnIndexUpdate?.ToBoolString(),
                    Conditions = rendering.Personalization?.Conditions,
                    Rules = rendering.Personalization?.RuleSet != null
                        ? XElement.Parse(RulesDefinition(rendering.Personalization!.RuleSet).ToString(SaveOptions.DisableFormatting))
                        : null,
                    MultiVariateTest = rendering.Personalization?.MultiVariateTestId,
                    PersonalizationTest = rendering.Personalization?.PersonalizationTest,
                    Parameters = SerializeRenderingParameters(rendering.Parameters),
                });
            }

            return renderings;
        }

        private static RulesDefinition RulesDefinition(RuleSetModel rules)
        {
            var rulesDefinition = SetRulesDefinition(rules);
            rulesDefinition = new RulesDefinition(rulesDefinition.ToString());

            foreach (var rule in rules.Rules)
            {
                var newRule = rulesDefinition.AddRule(ParseGuid(rule.UniqueId));
                newRule.SetAttributeValue("name", rule.Name);

                if (!string.IsNullOrEmpty(rule.Conditions))
                {
                    newRule.Add(XElement.Parse(rule.Conditions!));
                }

                //Add all additional unknown attributes
                if (rule.Parameters != null)
                {
                    foreach (var parameter in rule.Parameters)
                    {
                        newRule.SetAttributeValue(parameter.Key, parameter.Value);
                    }
                }

                PopulateAction(rule, rulesDefinition);
            }

            return rulesDefinition;
        }

        private static void PopulateAction(RuleModel rule, RulesDefinition rulesDefinition)
        {
            if (rule.RuleActions == null)
            {
                return;
            }

            foreach (var ruleAction in rule.RuleActions)
            {
                var action = rulesDefinition.AddAction(ParseGuid(rule.UniqueId), ruleAction.Id);
                action.SetAttributeValue(Rules.RulesDefinition.UidAttributeName, ruleAction.UniqueId);

                if (!string.IsNullOrEmpty(ruleAction.RenderingItem))
                {
                    action.SetAttributeValue("RenderingItem", ruleAction.RenderingItem);
                }

                if (!string.IsNullOrEmpty(ruleAction.DataSource))
                {
                    action.SetAttributeValue("DataSource", ruleAction.DataSource);
                }

                if (ruleAction.RenderingParameters?.Any() ?? false)
                {
                    var serializedRenderingParameters = SerializeRenderingParameters(ruleAction.RenderingParameters);
                    action.SetAttributeValue("Parameters", serializedRenderingParameters);
                }

                if (ruleAction.Parameters == null)
                {
                    continue;
                }

                foreach (var parameter in ruleAction.Parameters)
                {
                    action.SetAttributeValue(parameter.Key, parameter.Value);
                }
            }
        }

        private static RulesDefinition SetRulesDefinition(RuleSetModel rules)
        {
            var rulesDefinition = new RulesDefinition(string.Empty);
            var rulesDefinitionElement = XElement.Parse(rulesDefinition.ToString());

            if (rules.Pet.HasValue)
            {
                rulesDefinitionElement.SetAttributeValue("pet", rules.Pet.Value);
            }

            if (rules.Parameters != null)
            {
                foreach (var parameter in rules.Parameters)
                {
                    rulesDefinitionElement.SetAttributeValue(parameter.Key, parameter.Value);
                }
            }

            return new RulesDefinition(rulesDefinitionElement.ToString());
        }

        private static Guid ParseGuid(string value)
        {
            return Guid.TryParse(value, out var parsed) ? parsed : Guid.Empty;
        }

        private static string SerializeRenderingParameters(Dictionary<string, string> parameters)
        {
            var urlParameters = new UrlString();
            foreach (var parameter in parameters)
            {
                urlParameters.Append(parameter.Key ?? string.Empty, parameter.Value ?? string.Empty);
            }
            
            return urlParameters.ToString();
        }
    }
}
