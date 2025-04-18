// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ItemTimelineGraphType : ObjectGraphType<ItemPublishingTimeline>
    {
        public ItemTimelineGraphType()
        {
            Name = "ItemTimeline";

            Field<StringGraphType>("id", resolve: context => context.Source.ItemId);
            Field<ListGraphType<PublishingRangeGraphType>>("ranges", resolve: context => context.Source.PublishingRanges);
        }
    }
}
