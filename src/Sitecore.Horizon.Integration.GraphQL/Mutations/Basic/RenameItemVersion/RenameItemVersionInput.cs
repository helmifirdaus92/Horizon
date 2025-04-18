// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.RenameItemVersion
{
    internal class RenameItemVersionInput : BaseItemInput
    {
        public RenameItemVersionInput()
        {
            Name = "RenameItemVersionInput";

            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<IntGraphType>>("versionNumber");
            Field<NonNullGraphType<StringGraphType>>("newName");
        }

        public string Path { get; set; }
        public int VersionNumber { get; set; }
        public string NewName { get; set; }
    }
}
