// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using NSubstitute;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.PopulateRawTimelineMetadata
{
    public class RegisterItemRestrictionsTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldRegisterPageRestrictionWhenValidRangeSpecified(
            RegisterItemRestrictions sut,
            FakeItem item,
            DateTime publishDate)
        {
            // arrange
            item.WithPublishing();

            DateTime unpublishDate = publishDate.AddYears(1);

            var scItem = item.ToSitecoreItem();
            scItem.Publishing.PublishDate.Returns(publishDate);
            scItem.Publishing.UnpublishDate.Returns(unpublishDate);

            var args = PopulateRawTimelineMetadataArgs.Create(scItem);

            // act
            sut.Process(ref args);

            // assert
            var restrictions = args.Metadata.RawTimelineRestrictions;

            restrictions.Should().HaveCount(1);
            restrictions.First().AllowedRanges.Should().BeEquivalentTo(new PublishingRange(publishDate, unpublishDate));
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipPageRestrictionWhenRangeIsNotValid(
            RegisterItemRestrictions sut,
            FakeItem item,
            DateTime publishDate)
        {
            // arrange
            item.WithPublishing();

            DateTime unpublishDate = publishDate.AddYears(-1);

            var scItem = item.ToSitecoreItem();
            scItem.Publishing.PublishDate.Returns(publishDate);
            scItem.Publishing.UnpublishDate.Returns(unpublishDate);

            var args = PopulateRawTimelineMetadataArgs.Create(scItem);

            // act
            sut.Process(ref args);

            // assert
            var restrictions = args.Metadata.RawTimelineRestrictions;

            restrictions.Should().BeEmpty();
        }
    }
}
