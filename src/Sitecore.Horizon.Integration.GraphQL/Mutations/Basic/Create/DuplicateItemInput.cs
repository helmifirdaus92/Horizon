// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Create
{
    internal class DuplicateItemInput : BaseItemInput
    {
        public DuplicateItemInput()
        {
            Name = "DuplicateItemInput";

            Field<NonNullGraphType<StringGraphType>>("sourceItemId");
            Field<NonNullGraphType<StringGraphType>>("newItemName");
        }

        public string SourceItemId { get; set; }
        public string NewItemName { get; set; }
    }
}
