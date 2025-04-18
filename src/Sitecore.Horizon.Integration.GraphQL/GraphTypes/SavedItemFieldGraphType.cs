// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Validation;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class SavedItemFieldGraphType : ObjectGraphType<HorizonArgsSaveField>
    {
        public SavedItemFieldGraphType()
        {
            Name = "SavedItemField";

            Field<StringGraphType>("id", resolve: ctx => ctx.Source.ID);
            Field<StringGraphType>("value", resolve: ctx => ctx.Source.Value);
            Field<StringGraphType>("originalValue", resolve: ctx => ctx.Source.OriginalValue);
            Field<StringGraphType>("reset", resolve: ctx => ctx.Source.Reset);
        }
    }
}
