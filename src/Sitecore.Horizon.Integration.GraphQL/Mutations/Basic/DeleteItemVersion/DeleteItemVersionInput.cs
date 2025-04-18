// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteItemVersion
{
    internal class DeleteItemVersionInput : BaseItemInput
    {
        public DeleteItemVersionInput()
        {
            Name = "DeleteItemVersionInput";

            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<IntGraphType>>("versionNumber");
        }

        public string Path { get; set; }
        public int VersionNumber { get; set; }
    }
}
