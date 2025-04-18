// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.ChangeDisplayName
{
    internal class ChangeDisplayNameInput : BaseItemInput
    {
        public ChangeDisplayNameInput()
        {
            Name = "ChangeDisplayNameInput";

            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<StringGraphType>>("newDisplayName");
        }

        public string Path { get; set; }
        public string NewDisplayName { get; set; }
    }
}
