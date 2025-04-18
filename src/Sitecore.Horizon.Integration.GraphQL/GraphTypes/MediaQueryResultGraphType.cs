// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Media;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class MediaQueryResultGraphType : ObjectGraphType<MediaQueryResult>
    {
        public MediaQueryResultGraphType()
        {
            Name = "MediaQueryResult";

            Field<NonNullGraphType<ListGraphType<NonNullGraphType<MediaItemGraphType>>>>(
                "items",
                resolve: ctx => ctx.Source.Items);

            Field<NonNullGraphType<BooleanGraphType>>(
                "hasMoreItems",
                resolve: ctx => ctx.Source.HasMoreItems);
        }
    }
}
