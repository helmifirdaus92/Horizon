// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal struct BuildItemPublishingTimelineArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public Item Item { get; init; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter required here for good usability.")]
        public ICollection<ItemVersionPublishingRange>? ItemPublishingRanges { get; set; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter required here for good usability.")]
        public ICollection<PublishingTimelineRestriction>? TimelineRestrictions { get; set; }

        public ItemPublishingTimeline? ResultTimeline { get; set; }

        public static BuildItemPublishingTimelineArgs Create(Item item)
        {
            return new()
            {
                Item = item
            };
        }
    }
}
