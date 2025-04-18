// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Items.Workflow;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation
{
    internal class ValidationResultGraphType : ObjectGraphType<PageValidationResult>
    {
        public ValidationResultGraphType()
        {
            Name = "ValidationResult";

            Field<ItemValidationResultGraphType>("pageItemResult", resolve: ctx => ctx.Source.PageItemResult);
            Field<ListGraphType<ItemValidationResultGraphType>>("defaultDatasourceItemsResult", resolve: ctx => ctx.Source.DefaultDatasourceItemsResult);
            Field<ListGraphType<ItemValidationResultGraphType>>("personalizedDatasourceItemsResult", resolve: ctx => ctx.Source.PersonalizedDatasourceItemsResult);
        }
    }
}
