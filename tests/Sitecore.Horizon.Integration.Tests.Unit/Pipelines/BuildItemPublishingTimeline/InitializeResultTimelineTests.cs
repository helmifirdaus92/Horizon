// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.BuildItemPublishingTimeline
{
    public class InitializeResultTimelineTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNotRewriteAlreadySpecifiedTimeline(
            InitializeResultTimeline sut,
            BuildItemPublishingTimelineArgs args,
            ItemPublishingTimeline timeline)
        {
            // arrange
            args.ResultTimeline = timeline;

            // act
            sut.Process(ref args);

            // assert
            args.ResultTimeline.Should().BeSameAs(timeline);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldInitializeTimelineIfNotSpecified(
            InitializeResultTimeline sut,
            BuildItemPublishingTimelineArgs args)
        {
            // arrange
            args.ResultTimeline = null;

            // act
            sut.Process(ref args);

            // assert
            args.ResultTimeline.Should().NotBeNull();
        }
    }
}
