// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class MediaFolderItemGraphType : ObjectGraphType<Item>
    {
        public MediaFolderItemGraphType(IHorizonItemHelper itemHelper)
        {
            Name = "MediaFolderItem";

            Field<NonNullGraphType<StringGraphType>>(
                name: "id",
                resolve: ctx => ctx.Source.ID);

            Field<NonNullGraphType<StringGraphType>>(
                name: "parentId",
                resolve: ctx => ctx.Source.ParentID);

            Field<NonNullGraphType<StringGraphType>>(
                name: "displayName",
                resolve: ctx => ctx.Source.DisplayName);

            Field<ListGraphType<MediaFolderItemGraphType>>(
                name: "children",
                resolve: ctx => ctx.Source.Children.Where(x => itemHelper.IsMediaFolder(x) || itemHelper.IsFolder(x)));

            Field<NonNullGraphType<BooleanGraphType>>(
                name: "hasChildren",
                resolve: ctx => ctx.Source.Children.Any(x => itemHelper.IsMediaFolder(x) || itemHelper.IsFolder(x)));

            Field<NonNullGraphType<MediaItemPermissionsGraphType>>("permissions", resolve: ctx => ctx.Source);
        }
    }
}
