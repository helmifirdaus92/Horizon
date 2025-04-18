// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata
{
    internal struct PopulateRawTimelineMetadataArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public Item Item { get; init; }

        public PublishingTimelineMetadata Metadata { get; init; }

        public static PopulateRawTimelineMetadataArgs Create(Item item)
        {
            return new()
            {
                Item = item,
                Metadata = new PublishingTimelineMetadata()
            };
        }
    }
}
