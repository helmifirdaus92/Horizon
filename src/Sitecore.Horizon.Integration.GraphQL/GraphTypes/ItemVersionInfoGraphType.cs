// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ItemVersionInfoGraphType : ObjectGraphType<ItemVersionInfo>
    {
        public ItemVersionInfoGraphType()
        {
            Name = "ItemVersionInfo";
            Field<NonNullGraphType<StringGraphType>>("itemId", resolve: ctx => ctx.Source.ItemId);
            Field<NonNullGraphType<IntGraphType>>("versionNumber", resolve: ctx => ctx.Source.VersionNumber);
            Field<NonNullGraphType<StringGraphType>>("displayName", resolve: ctx => ctx.Source.DisplayName);
        }
    }
}
