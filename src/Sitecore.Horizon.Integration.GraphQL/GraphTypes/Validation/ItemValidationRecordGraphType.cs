// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation
{
    internal class ItemValidationRecordGraphType : ObjectGraphType<ValidationRecord>
    {
        public ItemValidationRecordGraphType()
        {
            Name = "ItemValidationRecord";
            Field<StringGraphType>("validatorResult", resolve: ctx => ctx.Source.ValidatorResult);
            Field<StringGraphType>("validatorTitle", resolve: ctx => ctx.Source.ValidatorTitle);
            Field<StringGraphType>("validatorDescription", resolve: ctx => ctx.Source.ValidatorDescription);
            Field<StringGraphType>("validatorText", resolve: ctx => ctx.Source.ValidatorText);
            Field<ListGraphType<StringGraphType>>("errors", resolve: ctx => ctx.Source.Errors);
        }
    }
}
