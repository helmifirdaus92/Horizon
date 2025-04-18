// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata
{
    internal class PopulateItemVersions : IHorizonPipelineProcessor<PopulateRawTimelineMetadataArgs>
    {
        public void Process(ref PopulateRawTimelineMetadataArgs args)
        {
            Item[] versions;

            using (new SiteFilteringSwitcher(disableFiltering: true))
            {
                versions = args.Item.Versions.GetVersions(false);
            }

            foreach (Item version in versions)
            {
                if (version.Publishing.HideVersion)
                {
                    continue;
                }

                DateTime versionPublishDate = GetVersionPublishDate(version);
                DateTime versionUnpublishDate = version.Publishing.ValidTo;

                var range = PublishingRange.CreateValidRangeOrNull(versionPublishDate, versionUnpublishDate);
                if (range == null)
                {
                    continue;
                }

                var publishingRange = new ItemVersionPublishingRange(version, range.Value);

                args.Metadata.RawItemPublishingRanges.Add(publishingRange);
            }
        }

        protected virtual DateTime GetVersionPublishDate(Item itemVersion)
        {
            Assert.ArgumentNotNull(itemVersion, nameof(itemVersion));

            DateTime validFrom = itemVersion.Publishing.ValidFrom;

            if (validFrom != DateTime.MinValue)
            {
                return validFrom;
            }

            return itemVersion.Statistics.Created;
        }
    }
}
