// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Workflow
{
    internal class HorizonWorkflowMutations : ObjectGraphType
    {
        private readonly IHorizonWorkflowManager _workflowManager;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISitecoreContext _scContext;

        public HorizonWorkflowMutations(IHorizonWorkflowManager workflowManager, IHorizonItemHelper itemHelper, ISitecoreContext scContext)
        {
            _workflowManager = workflowManager;
            _itemHelper = itemHelper;
            _scContext = scContext;

            Name = "WorkflowHorizonMutations";

            Field<ExecuteCommandOutput>("executeWorkflowCommand",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<ExecuteCommandInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<ExecuteCommandInput>("input");
                    return ExecuteWorkflowCommand(input.ItemId, input.ItemVersion, input.CommandId, input.Comments, input.Language, input.Site);
                });
        }

        private WorkflowCommandResult ExecuteWorkflowCommand(string itemId, int? itemVersion, string commandId, string? comments, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            var item = itemVersion.HasValue ? _itemHelper.GetItem(itemId, Version.Parse(itemVersion)) : _itemHelper.GetItem(itemId);
            if (item == null)
            {
                throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            }

            try
            {
                return _workflowManager.ExecuteCommand(commandId, comments, item);
            }
            catch (WorkflowCommandException ex)
            {
                throw new HorizonGqlError(GenericErrorCodes.UnknownError, ex.Message);
            }
        }
    }
}
