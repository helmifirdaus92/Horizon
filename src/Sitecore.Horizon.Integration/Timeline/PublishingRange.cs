// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Timeline
{
    [DebuggerDisplay("{PublishDate} - {UnpublishDate}")]
    internal readonly struct PublishingRange : IEquatable<PublishingRange>
    {
        [SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", Justification = "To be consistent with Sitecore field name.")]
        public PublishingRange(DateTime publishDate, DateTime unpublishDate)
        {
            Assert.ArgumentCondition(publishDate < unpublishDate, nameof(publishDate), "Publish date should be less than unpublish date.");

            PublishDate = publishDate;
            UnpublishDate = unpublishDate;
        }

        public DateTime PublishDate { get; }

        [SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", Justification = "To be consistent with Sitecore field name.")]
        public DateTime UnpublishDate { get; }

        public static bool operator ==(PublishingRange range1, PublishingRange range2)
        {
            return range1.Equals(range2);
        }

        public static bool operator !=(PublishingRange range1, PublishingRange range2)
        {
            return !range1.Equals(range2);
        }

        [SuppressMessage("Microsoft.Naming", "CA1704:IdentifiersShouldBeSpelledCorrectly", Justification = "To be consistent with Sitecore field name.")]
        public static PublishingRange? CreateValidRangeOrNull(DateTime publishDate, DateTime unpublishDate)
        {
            // Publish date should be less than Unpublish date.
            // Otherwise it's a broken range.
            if (publishDate < unpublishDate)
            {
                return new PublishingRange(publishDate, unpublishDate);
            }

            return null;
        }

        public bool Equals(PublishingRange other)
        {
            return PublishDate.Equals(other.PublishDate) && UnpublishDate.Equals(other.UnpublishDate);
        }

        public override bool Equals(object? obj)
        {
            if (ReferenceEquals(null, obj))
            {
                return false;
            }

            return obj is PublishingRange range && Equals(range);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                return (PublishDate.GetHashCode() * 397) ^ UnpublishDate.GetHashCode();
            }
        }
    }
}
