// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class SavedItemGraphType : ObjectGraphType<HorizonArgsSaveItem>
    {
        public SavedItemGraphType()
        {
            Name = "SavedItem";
            Field<NonNullGraphType<StringGraphType>>("id", resolve: ctx => ctx.Source.ID);
            Field<NonNullGraphType<StringGraphType>>("language", resolve: ctx => ctx.Source.Language.Name);
            Field<NonNullGraphType<IntGraphType>>("version", resolve: ctx => ctx.Source.Version.Number);
            Field<NonNullGraphType<StringGraphType>>("revision", resolve: ctx => ID.Parse(ctx.Source.Revision));
            Field<NonNullGraphType<ListGraphType<SavedItemFieldGraphType>>>("fields", resolve: ctx => ctx.Source.Fields);
        }
    }
}
