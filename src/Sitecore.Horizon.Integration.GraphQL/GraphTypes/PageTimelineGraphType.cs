// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Types;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal record PageTimelineInfo(ItemPublishingTimeline PageTimeline, IEnumerable<ItemPublishingTimeline> DataSourceTimelines);

    internal class PageTimelineGraphType : ObjectGraphType<PageTimelineInfo>
    {
        public PageTimelineGraphType()
        {
            Name = "PageTimeline";

            Field<ItemTimelineGraphType>("page", resolve: context => context.Source.PageTimeline);
            Field<ListGraphType<ItemTimelineGraphType>>("datasources", resolve: context => context.Source.DataSourceTimelines);
        }
    }
}
