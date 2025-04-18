// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.AddVersion
{
    internal class AddItemVersionInput : BaseItemInput
    {
        public AddItemVersionInput()
        {
            Name = "AddItemVersionInput";

            Field<NonNullGraphType<StringGraphType>>("path");
            Field<StringGraphType>("versionName");
            Field<IntGraphType>("baseVersionNumber");
        }

        public string Path { get; set; }
        public string VersionName { get; set; }
        public int? BaseVersionNumber { get; set; }
    }
}
