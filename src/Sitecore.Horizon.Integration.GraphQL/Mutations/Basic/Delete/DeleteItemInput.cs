// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Delete
{
    internal class DeleteItemInput : InputObjectGraphType
    {
        public DeleteItemInput()
        {
            Name = "DeleteItemInput";
            Field<StringGraphType>("language");
            Field<StringGraphType>("site");
            Field<NonNullGraphType<StringGraphType>>("path", description: "Path or ID of item to delete");
            Field<BooleanGraphType>("deletePermanently", "If set item deleted permanently, otherwise it is recycled");
        }

        public string Path { get; set; }
        public bool DeletePermanently { get; set; }
        public string? Language { get; set; }
        public string? Site { get; set; }
    }
}
