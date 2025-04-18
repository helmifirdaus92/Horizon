// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata
{
    internal class RegisterItemRestrictions : IHorizonPipelineProcessor<PopulateRawTimelineMetadataArgs>
    {
        public void Process(ref PopulateRawTimelineMetadataArgs args)
        {
            // We should NOT use Created date, even if PublishDate is not specified.
            // Created date does not affect publishing restrictions.
            // Some versions could be lost in case of Created date usage.
            DateTime itemPublishDate = args.Item.Publishing.PublishDate;
            DateTime itemUnpublishDate = args.Item.Publishing.UnpublishDate;

            var itemPublishingRange = PublishingRange.CreateValidRangeOrNull(itemPublishDate, itemUnpublishDate);
            if (itemPublishingRange != null)
            {
                args.Metadata.RawTimelineRestrictions.Add(new PublishingTimelineRestriction(itemPublishingRange.Value));
            }
        }
    }
}
