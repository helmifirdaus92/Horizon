// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class WorkflowErrorGraphType : ObjectGraphType<WorkflowError>
    {
        public WorkflowErrorGraphType()
        {
            Name = "WorkflowError";

            Field<StringGraphType>("errorCode", resolve: ctx => ctx.Source.ErrorCode.ToString());
            Field<StringGraphType>("message", resolve: ctx => ctx.Source.Message);

            Field<StringGraphType>("id", resolve: ctx => ctx.Source.ItemId);
        }
    }
}
