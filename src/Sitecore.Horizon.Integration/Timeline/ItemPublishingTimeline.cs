// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Data;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class ItemPublishingTimeline
    {
        public ItemPublishingTimeline(ID itemId, IEnumerable<ItemVersionPublishingRange> publishingRanges)
        {
            Assert.ArgumentNotNull(itemId, nameof(itemId));
            Assert.ArgumentNotNull(publishingRanges, nameof(publishingRanges));

            ItemId = itemId;
            PublishingRanges = publishingRanges.ToArray();
        }

        public ID ItemId { get; }

        public IReadOnlyCollection<ItemVersionPublishingRange> PublishingRanges { get; }
    }
}
