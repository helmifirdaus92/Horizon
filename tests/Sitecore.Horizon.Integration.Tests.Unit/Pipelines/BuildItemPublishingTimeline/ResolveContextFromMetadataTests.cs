// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildItemPublishingTimeline
{
    public class ResolveContextFromMetadataTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRewriteAlreadySpecifiedMetadata(
            [Frozen] IHorizonPipelines horizonPipelines,
            ResolveContextFromMetadata sut,
            BuildItemPublishingTimelineArgs args,
            List<ItemVersionPublishingRange> ranges,
            List<PublishingTimelineRestriction> restrictions)
        {
            // arrange
            args.ItemPublishingRanges = ranges;
            args.TimelineRestrictions = restrictions;

            // act
            sut.Process(ref args);

            // assert
            horizonPipelines.DidNotReceive().PopulateRawTimelineMetadata(ref Any.Arg<PopulateRawTimelineMetadataArgs>());

            args.ItemPublishingRanges.Should().BeSameAs(ranges);
            args.TimelineRestrictions.Should().BeSameAs(restrictions);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldReinitializeWholeMetadataWhenRangesAreNotSpecified(
            [Frozen] IHorizonPipelines horizonPipelines,
            ResolveContextFromMetadata sut,
            BuildItemPublishingTimelineArgs args,
            List<PublishingTimelineRestriction> restrictions)
        {
            // arrange
            args.ItemPublishingRanges = null;
            args.TimelineRestrictions = restrictions;

            // act
            sut.Process(ref args);

            // assert
            horizonPipelines.Received(1).PopulateRawTimelineMetadata(ref Any.Arg<PopulateRawTimelineMetadataArgs>());

            args.ItemPublishingRanges.Should().NotBeNull();

            args.TimelineRestrictions.Should().NotBeNull();
            args.TimelineRestrictions.Should().NotBeSameAs(restrictions);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldReinitializeWholeMetadataWhenRestrictionsAreNotSpecified(
            [Frozen] IHorizonPipelines horizonPipelines,
            ResolveContextFromMetadata sut,
            BuildItemPublishingTimelineArgs args,
            List<ItemVersionPublishingRange> ranges)
        {
            // arrange
            args.ItemPublishingRanges = ranges;
            args.TimelineRestrictions = null;

            // act
            sut.Process(ref args);

            // assert
            horizonPipelines.Received(1).PopulateRawTimelineMetadata(ref Any.Arg<PopulateRawTimelineMetadataArgs>());

            args.TimelineRestrictions.Should().NotBeNull();

            args.ItemPublishingRanges.Should().NotBeNull();
            args.ItemPublishingRanges.Should().NotBeSameAs(ranges);
        }
    }
}
