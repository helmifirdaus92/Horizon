// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation
{
    internal class FieldValidationResultGraphType : ObjectGraphType<FiledValidationResult>
    {
        public FieldValidationResultGraphType()
        {
            Name = "FieldValidationResult";
            Field<StringGraphType>("fieldName", resolve: ctx => ctx.Source.FieldName);
            Field<StringGraphType>("fieldItemId", resolve: ctx => ctx.Source.FieldItemId);
            Field<ListGraphType<ItemValidationRecordGraphType>>("records", resolve: ctx => ctx.Source.Records);
        }
    }
}
