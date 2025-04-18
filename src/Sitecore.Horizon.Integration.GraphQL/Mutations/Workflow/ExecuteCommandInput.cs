// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Basic;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Workflow
{
    internal class ExecuteCommandInput : BaseItemInput
    {
        public ExecuteCommandInput()
        {
            Name = "ExecuteCommandInput";

            Field<NonNullGraphType<StringGraphType>>("itemId");
            Field<IntGraphType>("itemVersion");
            Field<NonNullGraphType<StringGraphType>>("commandId");
            Field<StringGraphType>("comments");
        }

        public string ItemId { get; set; }

        public int? ItemVersion { get; set; }

        public string CommandId { get; set; }

        public string? Comments { get; set; }
    }
}
