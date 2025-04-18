// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Sites;

namespace Sitecore.Horizon.Integration.Timeline
{
    internal class PublishingTimelineProvider : IPublishingTimelineProvider
    {
        private readonly IPublishingRangeHelper _rangeHelper;
        private readonly IHorizonPipelines _horizonPipelines;

        public PublishingTimelineProvider(
            IPublishingRangeHelper rangeHelper,
            IHorizonPipelines horizonPipelines)
        {
            Assert.ArgumentNotNull(rangeHelper, nameof(rangeHelper));

            _rangeHelper = rangeHelper;
            _horizonPipelines = horizonPipelines;
        }

        public virtual ItemPublishingTimeline BuildPageTimeline(Item pageItem)
        {
            Assert.ArgumentNotNull(pageItem, nameof(pageItem));

            var timelineArgs = BuildItemPublishingTimelineArgs.Create(pageItem);

            _horizonPipelines.BuildItemPublishingTimeline(ref timelineArgs);

            return timelineArgs.ResultTimeline ?? throw new InvalidOperationException("Page timeline is null.");
        }

        public virtual ICollection<ItemPublishingTimeline> BuildDataSourceTimelines(ItemPublishingTimeline pageTimeline, DeviceItem device)
        {
            Assert.ArgumentNotNull(pageTimeline, nameof(pageTimeline));
            Assert.ArgumentNotNull(device, nameof(device));

            var result = new List<ItemPublishingTimeline>();

            foreach (ItemVersionPublishingRange pageItemRange in pageTimeline.PublishingRanges)
            {
                var pageRestriction = new PublishingTimelineRestriction(pageItemRange.Range);

                ICollection<Item> dataSourceItems = ResolveDataSourceItems(pageItemRange.ItemVersion, device);

                foreach (Item dataSourceItem in dataSourceItems)
                {
                    var dataSourceTimeline = BuildSingleDataSourceTimeline(dataSourceItem, pageRestriction);

                    result.Add(dataSourceTimeline);
                }
            }

            return result
                .Where(x => x.PublishingRanges.Count > 0)
                .GroupBy(x => x.ItemId)
                .Select(group => new ItemPublishingTimeline(group.Key, MergeOverlappedRanges(group.SelectMany(x => x.PublishingRanges))))
                .ToList();
        }

        public virtual ICollection<ItemVersionPublishingRange> HandleVersionRangesOverlapping(IEnumerable<ItemVersionPublishingRange> rawPublishingRanges)
        {
            Assert.ArgumentNotNull(rawPublishingRanges, nameof(rawPublishingRanges));

            ItemVersionPublishingRange[] orderedPublishingRanges =
                rawPublishingRanges
                    .OrderByDescending(x => x.ItemVersion.Version, VersionComparer.Instance)
                    .ToArray();

            var collectedItemRanges = new List<ItemVersionPublishingRange>(orderedPublishingRanges.Length);

            foreach (ItemVersionPublishingRange publishingRange in orderedPublishingRanges)
            {
                var currentRange = publishingRange.Range;
                var collectedRanges = collectedItemRanges.Select(x => x.Range);

                var rangesDiff = _rangeHelper
                    .SubtractRanges(currentRange, collectedRanges)
                    .Select(range => new ItemVersionPublishingRange(publishingRange.ItemVersion, range));

                collectedItemRanges.AddRange(rangesDiff);
            }

            return collectedItemRanges;
        }

        public virtual ICollection<ItemVersionPublishingRange> ApplyTimelineRestriction(
            IEnumerable<ItemVersionPublishingRange> publishingRanges,
            PublishingTimelineRestriction restriction)
        {
            Assert.ArgumentNotNull(publishingRanges, nameof(publishingRanges));
            Assert.ArgumentNotNull(restriction, nameof(restriction));

            var result = new List<ItemVersionPublishingRange>();

            foreach (var publishingRange in publishingRanges)
            {
                PublishingRange range = publishingRange.Range;

                foreach (var allowedRange in restriction.AllowedRanges)
                {
                    PublishingRange? intersection = _rangeHelper.GetIntersection(range, allowedRange);
                    if (intersection != null)
                    {
                        PublishingRange intersectionRange = intersection.Value;

                        result.Add(new ItemVersionPublishingRange(publishingRange.ItemVersion, intersectionRange));
                    }
                }
            }

            return result;
        }

        protected virtual ItemPublishingTimeline BuildSingleDataSourceTimeline(Item dataSourceItem, PublishingTimelineRestriction pageRestriction)
        {
            Assert.ArgumentNotNull(dataSourceItem, nameof(dataSourceItem));
            Assert.ArgumentNotNull(pageRestriction, nameof(pageRestriction));

            BuildItemPublishingTimelineArgs timelineArgs = BuildItemPublishingTimelineArgs.Create(dataSourceItem);

            _horizonPipelines.BuildItemPublishingTimeline(ref timelineArgs);

            var timeline = timelineArgs.ResultTimeline ?? throw new InvalidOperationException("Datasource timeline is null.");

            var filteredRanges = ApplyTimelineRestriction(timeline.PublishingRanges, pageRestriction);

            return new ItemPublishingTimeline(timeline.ItemId, filteredRanges);
        }

        protected virtual ICollection<Item> ResolveDataSourceItems(Item pageItemVersion, DeviceItem device)
        {
            Assert.ArgumentNotNull(pageItemVersion, nameof(pageItemVersion));
            Assert.ArgumentNotNull(device, nameof(device));

            using (new SiteFilteringSwitcher(disableFiltering: true))
            {
                var layoutMetadataArgs = GetItemLayoutDataSourcesArgs.Create(pageItemVersion, device);

                _horizonPipelines.GetItemLayoutDataSources(ref layoutMetadataArgs);

                return layoutMetadataArgs.DataSourceItems;
            }
        }

        protected virtual ICollection<ItemVersionPublishingRange> MergeOverlappedRanges(IEnumerable<ItemVersionPublishingRange> publishingRanges)
        {
            Assert.ArgumentNotNull(publishingRanges, nameof(publishingRanges));

            var result = new List<ItemVersionPublishingRange>();

            foreach (var itemVersionGroup in publishingRanges.GroupBy(x => x.ItemVersion.Version.Number))
            {
                var itemVersion = itemVersionGroup.First().ItemVersion;
                var ranges = itemVersionGroup.Select(x => x.Range);

                var mergedItemRanges = _rangeHelper.MergeOverlappedRanges(ranges)
                    .Select(x => new ItemVersionPublishingRange(itemVersion, x));

                result.AddRange(mergedItemRanges);
            }

            return result;
        }
    }
}
