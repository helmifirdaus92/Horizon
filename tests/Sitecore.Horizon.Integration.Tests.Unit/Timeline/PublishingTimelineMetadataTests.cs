// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class PublishingTimelineMetadataTests
    {
        [Fact]
        internal void Constructor_ShouldCreateObject()
        {
            // arrange

            // act
            var result = new PublishingTimelineMetadata();

            // assert
            result.RawItemPublishingRanges.Should().BeEmpty();
            result.RawTimelineRestrictions.Should().BeEmpty();
        }
    }
}
