// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal interface IPublishingRangeHelper
    {
        PublishingRange? GetIntersection(in PublishingRange currentRange, in PublishingRange range);

        ICollection<PublishingRange> SubtractRanges(in PublishingRange currentRange, IEnumerable<PublishingRange> rangesToSubtract);

        ICollection<PublishingRange> MergeOverlappedRanges(IEnumerable<PublishingRange> publishingRanges);
    }
}
