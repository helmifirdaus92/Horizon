// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
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
    public class ApplyRestrictionsTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldAggregateResultRangesBasedOnAllRestrictions(
            [Frozen] IPublishingTimelineProvider timelineProvider,
            ApplyRestrictions sut,
            BuildItemPublishingTimelineArgs args,
            List<ItemVersionPublishingRange> ranges,
            List<PublishingTimelineRestriction> restrictions,
            ICollection<ItemVersionPublishingRange> finalRanges)
        {
            // arrange
            args.ItemPublishingRanges = ranges;
            args.TimelineRestrictions = restrictions;
            timelineProvider
                .ApplyTimelineRestriction(Any.Arg<ICollection<ItemVersionPublishingRange>>(), Any.Arg<PublishingTimelineRestriction>())
                .Returns(finalRanges);


            // act
            sut.Process(ref args);

            // assert
            args.ItemPublishingRanges.Should().BeEquivalentTo(finalRanges);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldThrowWhenRangesAreNotInitialized(
            ApplyRestrictions sut,
            BuildItemPublishingTimelineArgs args)
        {
            // arrange
            args.ItemPublishingRanges = null;

            // act

            // assert
            sut.Invoking(x => x.Process(ref args)).Should().Throw<ArgumentNullException>();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldThrowWhenRestrictionsAreNotInitialized(
            ApplyRestrictions sut,
            BuildItemPublishingTimelineArgs args)
        {
            // arrange
            args.TimelineRestrictions = null;

            // act

            // assert
            sut.Invoking(x => x.Process(ref args)).Should().Throw<ArgumentNullException>();
        }
    }
}
