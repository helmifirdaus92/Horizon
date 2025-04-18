// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ValidationErrorGraphType : ObjectGraphType<ValidationError>
    {
        public ValidationErrorGraphType()
        {
            Name = "ValidationError";

            Field<StringGraphType>("fieldId", resolve: ctx => ctx.Source.FieldId);
            Field<StringGraphType>("errorMessage", resolve: ctx => ctx.Source.ErrorMessage);
            Field<StringGraphType>("errorLevel", resolve: ctx => ctx.Source.ErrorLevel);
            Field<StringGraphType>("aborted", resolve: ctx => ctx.Source.ShouldAbortPipeline);
        }
    }
}
