// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Basic.Save
{
    internal class SaveItemOutput : ObjectGraphType<HorizonSaveItemArgs>
    {
        public SaveItemOutput()
        {
            Name = "SaveItemOutput";

            Field<ListGraphType<ValidationErrorGraphType>>("validationErrors", resolve: ctx => ctx.Source.ValidationErrors);
            Field<ListGraphType<SaveItemErrorGraphType>>("errors", resolve: ctx => ctx.Source.Errors);
            Field<ListGraphType<StringGraphType>>("warnings", resolve: ctx => ctx.Source.Warnings);
            Field<ListGraphType<SavedItemGraphType>>("savedItems", resolve: ctx => ctx.Source.SavedItems);
            Field<ListGraphType<ItemVersionInfoGraphType>>("newCreatedVersions", resolve: ctx => ctx.Source.NewCreatedVersions);
        }
    }
}
