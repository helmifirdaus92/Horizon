// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal interface IPublishingTimelineProvider
    {
        ItemPublishingTimeline BuildPageTimeline(Item pageItem);

        ICollection<ItemPublishingTimeline> BuildDataSourceTimelines(ItemPublishingTimeline pageTimeline, DeviceItem device);

        ICollection<ItemVersionPublishingRange> HandleVersionRangesOverlapping(IEnumerable<ItemVersionPublishingRange> rawPublishingRanges);

        ICollection<ItemVersionPublishingRange> ApplyTimelineRestriction(
            IEnumerable<ItemVersionPublishingRange> publishingRanges,
            PublishingTimelineRestriction restriction);
    }
}
