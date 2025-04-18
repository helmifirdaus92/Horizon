// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class PublishingTimelineMetadata
    {
        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This collection should not be overrided, but values could be updated.")]
        public List<PublishingTimelineRestriction> RawTimelineRestrictions { get; } = new();


        [SuppressMessage("Microsoft.Design", "CA1002:DoNotExposeGenericLists", Justification = "This collection should not be overrided, but values could be updated.")]
        public List<ItemVersionPublishingRange> RawItemPublishingRanges { get; } = new();
    }
}
