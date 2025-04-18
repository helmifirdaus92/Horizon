// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class PublishingRangeHelper : IPublishingRangeHelper
    {
        public virtual PublishingRange? GetIntersection(in PublishingRange currentRange, in PublishingRange range)
        {
            bool containsPublishDate = IsDateInRangeInclusive(currentRange, range.PublishDate);
            bool containsUnpublishDate = IsDateInRangeInclusive(currentRange, range.UnpublishDate);

            // Current range encloses range
            if (containsPublishDate && containsUnpublishDate)
            {
                return range;
            }

            // Range starts inside of current range
            if (containsPublishDate)
            {
                return PublishingRange.CreateValidRangeOrNull(range.PublishDate, currentRange.UnpublishDate);
            }

            // Range ends inside of current range
            if (containsUnpublishDate)
            {
                return PublishingRange.CreateValidRangeOrNull(currentRange.PublishDate, range.UnpublishDate);
            }

            // Range encloses current range
            if (IsDateInRangeInclusive(range, currentRange.PublishDate) && IsDateInRangeInclusive(range, currentRange.UnpublishDate))
            {
                return currentRange;
            }

            return null;
        }

        public virtual ICollection<PublishingRange> SubtractRanges(in PublishingRange currentRange, IEnumerable<PublishingRange> rangesToSubtract)
        {
            Assert.ArgumentNotNull(rangesToSubtract, nameof(rangesToSubtract));

            var currentResult = new List<PublishingRange>
            {
                currentRange
            };

            foreach (PublishingRange rangeToSubtract in rangesToSubtract)
            {
                currentResult = currentResult
                    .SelectMany(current => SubtractRange(current, rangeToSubtract))
                    .ToList();
            }

            return currentResult;
        }

        public virtual ICollection<PublishingRange> MergeOverlappedRanges(IEnumerable<PublishingRange> publishingRanges)
        {
            Assert.ArgumentNotNull(publishingRanges, nameof(publishingRanges));

            var orderedPublishingRanges = publishingRanges.OrderBy(x => x.PublishDate).ToList();
            if (orderedPublishingRanges.Count <= 1)
            {
                return orderedPublishingRanges;
            }

            var result = new List<PublishingRange>();

            var aggregatedRange = orderedPublishingRanges[0];

            foreach (PublishingRange range in orderedPublishingRanges.Skip(1))
            {
                if (range.PublishDate <= aggregatedRange.UnpublishDate && range.UnpublishDate > aggregatedRange.UnpublishDate)
                {
                    aggregatedRange = new PublishingRange(aggregatedRange.PublishDate, range.UnpublishDate);
                }
                else
                {
                    result.Add(aggregatedRange);

                    aggregatedRange = range;
                }
            }

            result.Add(aggregatedRange);

            return result;
        }

        [SuppressMessage("Microsoft.Design", "CA1045:DoNotPassTypesByReference", Justification = "'in' keyword is a common usage for readonly struct.")]
        protected static bool IsDateInRangeInclusive(in PublishingRange range, DateTime date) => range.PublishDate <= date && range.UnpublishDate >= date;

        protected virtual ICollection<PublishingRange> SubtractRange(in PublishingRange currentRange, in PublishingRange range)
        {
            var result = new List<PublishingRange>();

            var intersection = GetIntersection(currentRange, range);
            if (intersection == null)
            {
                result.Add(currentRange);
                return result;
            }

            var intersectionValue = intersection.Value;

            if (currentRange.PublishDate < intersectionValue.PublishDate)
            {
                result.Add(new PublishingRange(currentRange.PublishDate, intersectionValue.PublishDate));
            }

            if (currentRange.UnpublishDate > intersectionValue.UnpublishDate)
            {
                result.Add(new PublishingRange(intersectionValue.UnpublishDate, currentRange.UnpublishDate));
            }

            return result;
        }
    }
}
