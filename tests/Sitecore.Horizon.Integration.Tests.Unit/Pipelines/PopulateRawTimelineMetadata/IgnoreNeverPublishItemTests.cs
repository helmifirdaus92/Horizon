// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.PopulateRawTimelineMetadata
{
    public class IgnoreNeverPublishItemTests
    {
        [Theory]
        [InlineAutoNData(true, true)]
        [InlineAutoNData(false, false)]
        internal void Process_ShouldAbortPipelineBasedOnNeverPublishMark(
            bool neverPublish,
            bool shouldBeAborted,
            IgnoreNeverPublishItem sut,
            FakeItem item)
        {
            // arrange
            item.WithPublishing();

            var args = PopulateRawTimelineMetadataArgs.Create(item);
            args.Item.Publishing.NeverPublish.Returns(neverPublish);

            // act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().Be(shouldBeAborted);
        }
    }
}
