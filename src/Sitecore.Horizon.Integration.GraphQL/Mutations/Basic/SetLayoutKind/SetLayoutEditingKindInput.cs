// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Saving;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.SetLayoutKind
{
    internal class SetLayoutEditingKindInput : InputObjectGraphType
    {
        public SetLayoutEditingKindInput()
        {
            Name = "SetLayoutEditingKindInput";

            Field<NonNullGraphType<EnumerationGraphType<LayoutKind>>>("kind", description: "Layout kind to set for editing");
            Field<StringGraphType>("site");
        }

        public LayoutKind Kind { get; set; }
        public string? Site { get; set; }
    }
}
