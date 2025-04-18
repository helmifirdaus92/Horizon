// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildItemPublishingTimeline
{
    public class ProcessItemVersionOverlappingTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldHandleVersionOverlappingWhenMoreThanOneRange(
            [Frozen] IPublishingTimelineProvider timelineProvider,
            ProcessItemVersionOverlapping sut,
            BuildItemPublishingTimelineArgs args,
            ICollection<ItemVersionPublishingRange> overlappedRanges,
            IFixture fixture)
        {
            // arrange
            var ranges = fixture.CreateMany<ItemVersionPublishingRange>(3).ToList();

            args.ItemPublishingRanges = ranges;

            timelineProvider.HandleVersionRangesOverlapping(Any.Arg<IEnumerable<ItemVersionPublishingRange>>()).Returns(overlappedRanges);

            // act
            sut.Process(ref args);

            // assert
            args.ItemPublishingRanges.Should().BeEquivalentTo(overlappedRanges);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotHandleVersionOverlappingWhenOnlyOneRange(
            [Frozen] IPublishingTimelineProvider timelineProvider,
            ProcessItemVersionOverlapping sut,
            BuildItemPublishingTimelineArgs args,
            ICollection<ItemVersionPublishingRange> overlappedRanges,
            IFixture fixture)
        {
            // arrange
            List<ItemVersionPublishingRange> ranges = fixture.CreateMany<ItemVersionPublishingRange>(1).ToList();

            args.ItemPublishingRanges = ranges;

            timelineProvider.HandleVersionRangesOverlapping(Any.Arg<IEnumerable<ItemVersionPublishingRange>>()).Returns(overlappedRanges);

            // act
            sut.Process(ref args);

            // assert
            args.ItemPublishingRanges.Should().BeEquivalentTo(ranges);
        }
    }
}
