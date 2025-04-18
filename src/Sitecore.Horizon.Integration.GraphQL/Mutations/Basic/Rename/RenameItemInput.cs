// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Rename
{
    internal class RenameItemInput : InputObjectGraphType
    {
        public RenameItemInput()
        {
            Name = "RenameItemInput";

            Field<StringGraphType>("language");
            Field<StringGraphType>("site");
            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<StringGraphType>>("newName");
        }

        public string Path { get; set; }
        public string NewName { get; set; }
        public string Language { get; set; }
        public string Site { get; set; }
    }
}
