// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation
{
    internal class ItemValidationResultGraphType : ObjectGraphType<ItemValidationResult>
    {
        public ItemValidationResultGraphType()
        {
            Name = "ItemValidationResult";
            Field<StringGraphType>("itemName", resolve: ctx => ctx.Source.ItemName);
            Field<StringGraphType>("itemId", resolve: ctx => ctx.Source.ItemId);
            Field<ListGraphType<ItemValidationRecordGraphType>>("itemRulesResult", resolve: ctx => ctx.Source.ItemRulesResult);
            Field<ListGraphType<FieldValidationResultGraphType>>("fieldRulesResult", resolve: ctx => ctx.Source.FieldRulesResult);
        }
    }
}
