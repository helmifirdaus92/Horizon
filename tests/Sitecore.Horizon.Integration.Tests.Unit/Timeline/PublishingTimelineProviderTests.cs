// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class PublishingTimelineProviderTests
    {
        [Theory]
        [AutoNData]
        internal void BuildPageTimeline_ShouldDelegateToPipeline(
            [Frozen] IHorizonPipelines horizonPipelines,
            PublishingTimelineProvider sut,
            Item pageItem,
            ItemPublishingTimeline resultTimeline)
        {
            // arrange
            horizonPipelines
                .BuildItemPublishingTimeline(ref Any.ArgDo((ref BuildItemPublishingTimelineArgs args) => args.ResultTimeline = resultTimeline));

            // act
            ItemPublishingTimeline timeline = sut.BuildPageTimeline(pageItem);

            // assert
            timeline.Should().BeSameAs(resultTimeline);
        }

        [Theory]
        [AutoNData]
        internal void BuildPageTimeline_ShouldThrowWhenResultTimelineIsNull(
            PublishingTimelineProvider sut,
            BuildItemPublishingTimelineArgs args)
        {
            // arrange

            // act
            // assert
            sut.Invoking(x => x.BuildPageTimeline(args.Item)).Should().Throw<InvalidOperationException>();
        }


        [Theory]
        [AutoNData]
        internal void BuildDataSourceTimelines_ShouldAggregateTimelinesFromAllDataSources(
            [Frozen] IHorizonPipelines horizonPipelines,
            PublishingTimelineProvider sut,
            ItemPublishingTimeline timeline,
            DeviceItem device,
            IFixture fixture)
        {
            // arrange
            horizonPipelines
                .GetItemLayoutDataSources(ref Any.ArgDo((ref GetItemLayoutDataSourcesArgs args) => args.DataSourceItems.Add(fixture.Create<Item>())));

            horizonPipelines
                .BuildItemPublishingTimeline(ref Any.ArgDo((ref BuildItemPublishingTimelineArgs args) => args.ResultTimeline = fixture.Create<ItemPublishingTimeline>()));

            int expectedResultCount = timeline.PublishingRanges.Count;

            // act
            var result = sut.BuildDataSourceTimelines(timeline, device);

            // assert
            result.Should().HaveCount(expectedResultCount);
        }

        [Theory]
        [AutoNData]
        internal void BuildDataSourceTimelines_ShouldGroupTimelinesByItemId(
            [Frozen] IHorizonPipelines horizonPipelines,
            PublishingTimelineProvider sut,
            ItemPublishingTimeline timeline,
            DeviceItem device,
            List<Item> dataSourceItems,
            List<ItemVersionPublishingRange> ranges)
        {
            // arrange
            dataSourceItems.Add(dataSourceItems.Last());

            int expectedResultCount = dataSourceItems.Count - 1;

            horizonPipelines
                .GetItemLayoutDataSources(ref Arg.Do<GetItemLayoutDataSourcesArgs>(args =>
                {
                    foreach (Item item in dataSourceItems)
                    {
                        args.DataSourceItems.Add(item);
                    }
                }));

            horizonPipelines
                .BuildItemPublishingTimeline(ref Any.ArgDo((ref BuildItemPublishingTimelineArgs args) => args.ResultTimeline = new ItemPublishingTimeline(args.Item.ID, ranges)));

            // act
            var result = sut.BuildDataSourceTimelines(timeline, device);

            // assert
            result.Should().HaveCount(expectedResultCount);
        }

        [Theory]
        [AutoNData]
        internal void BuildDataSourceTimelines_ShouldMergeOverlappedRanges(
            [Frozen(Matching.ImplementedInterfaces)]
            PublishingRangeHelper rangeHelper,
            [Frozen] IHorizonPipelines horizonPipelines,
            PublishingTimelineProvider sut,
            FakeItem pageItem,
            DeviceItem device,
            FakeItem dataSourceItem,
            DateTime date)
        {
            // arrange
            var pageTimeline = new ItemPublishingTimeline(pageItem.ID, new[]
            {
                new ItemVersionPublishingRange(pageItem, new PublishingRange(DateTime.MinValue, DateTime.MaxValue)),
            });

            var ranges = new List<ItemVersionPublishingRange>
            {
                new ItemVersionPublishingRange(dataSourceItem, new PublishingRange(date, date.AddYears(1))),
                new ItemVersionPublishingRange(dataSourceItem, new PublishingRange(date.AddDays(-1), date.AddDays(1))),
            };

            horizonPipelines
                .GetItemLayoutDataSources(ref Any.ArgDo((ref GetItemLayoutDataSourcesArgs args) => args.DataSourceItems.Add(dataSourceItem)));

            horizonPipelines
                .BuildItemPublishingTimeline(ref Any.ArgDo((ref BuildItemPublishingTimelineArgs args) => args.ResultTimeline = new ItemPublishingTimeline(args.Item.ID, ranges)));

            // act
            var result = sut.BuildDataSourceTimelines(pageTimeline, device);

            // assert
            result.Should().HaveCount(1);
        }

        [Theory]
        [AutoNData]
        internal void ApplyTimelineRestriction_ShouldAggregateAllIntersectionsWithAllowedRanges(
            [Frozen] IPublishingRangeHelper rangeHelper,
            PublishingTimelineProvider sut,
            List<ItemVersionPublishingRange> publishingRanges,
            PublishingTimelineRestriction restriction)
        {
            // arrange

            // act
            sut.ApplyTimelineRestriction(publishingRanges, restriction);

            // assert
            rangeHelper.Received(publishingRanges.Count * restriction.AllowedRanges.Count).GetIntersection(Any.Arg<PublishingRange>(), Any.Arg<PublishingRange>());
        }

        [Theory]
        [AutoNData]
        internal void ApplyTimelineRestriction_NewerVersionShouldOverlapOlderOne(
            [Frozen(Matching.ImplementedInterfaces)]
            PublishingRangeHelper rangeHelper,
            PublishingTimelineProvider sut,
            DateTime date,
            IFixture fixture)
        {
            // arrange
            var publishingRanges = new List<ItemVersionPublishingRange>
            {
                new ItemVersionPublishingRange(fixture.Create<FakeItem>().WithVersion(1), new PublishingRange(date, date.AddYears(1))),
                new ItemVersionPublishingRange(fixture.Create<FakeItem>().WithVersion(2), new PublishingRange(date.AddMonths(1), date.AddMonths(2))),
                new ItemVersionPublishingRange(fixture.Create<FakeItem>().WithVersion(3), new PublishingRange(date.AddMonths(6), date.AddMonths(8)))
            };

            // act
            var result = sut.HandleVersionRangesOverlapping(publishingRanges);

            // assert
            result.Should().HaveCount(5);
            result.Should().Contain(x => x.Range == new PublishingRange(date, date.AddMonths(1)));
            result.Should().Contain(x => x.Range == new PublishingRange(date.AddMonths(1), date.AddMonths(2)));
            result.Should().Contain(x => x.Range == new PublishingRange(date.AddMonths(2), date.AddMonths(6)));
            result.Should().Contain(x => x.Range == new PublishingRange(date.AddMonths(6), date.AddMonths(8)));
            result.Should().Contain(x => x.Range == new PublishingRange(date.AddMonths(8), date.AddYears(1)));
        }
    }
}
