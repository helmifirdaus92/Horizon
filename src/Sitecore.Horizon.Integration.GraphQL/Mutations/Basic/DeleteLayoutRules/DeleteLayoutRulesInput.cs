// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.DeleteLayoutRules
{
    internal class DeleteLayoutRulesInput : BaseItemInput
    {
        public DeleteLayoutRulesInput()
        {
            Name = "DeleteLayoutRulesInput";

            Field<NonNullGraphType<StringGraphType>>("path");
            Field<NonNullGraphType<StringGraphType>>("variantId");
        }

        public string Path { get; set; }
        public string VariantId { get; set; }
    }
}
