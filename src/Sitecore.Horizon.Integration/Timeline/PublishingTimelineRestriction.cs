// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class PublishingTimelineRestriction
    {
        [SuppressMessage("Microsoft.Design", "CA1045:DoNotPassTypesByReference", Justification = "'in' keyword is a common usage for readonly struct.")]
        public PublishingTimelineRestriction(in PublishingRange allowedRange)
        {
            AllowedRanges = new[]
            {
                allowedRange
            };
        }

        public PublishingTimelineRestriction(IEnumerable<PublishingRange> allowedRanges)
        {
            Assert.ArgumentNotNull(allowedRanges, nameof(allowedRanges));

            AllowedRanges = allowedRanges.ToArray();
        }

        public IReadOnlyCollection<PublishingRange> AllowedRanges { get; }
    }
}
