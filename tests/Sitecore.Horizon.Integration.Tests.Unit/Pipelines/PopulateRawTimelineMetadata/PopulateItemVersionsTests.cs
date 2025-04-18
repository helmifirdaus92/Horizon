// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.PopulateRawTimelineMetadata
{
    public class PopulateItemVersionsTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldResolveVersionWithDisabledFiltering(
            PopulateItemVersions sut,
            FakeItem item,
            SiteContext site)
        {
            // arrange
            item.WithItemVersions();

            Item sitecoreItem = item.ToSitecoreItem();

            var args = PopulateRawTimelineMetadataArgs.Create(sitecoreItem);

            bool? disableFiltering = false;

            sitecoreItem.Versions
                .When(x => x.GetVersions(false))
                .Do(_ => { disableFiltering = Sitecore.Context.Site.DisableFiltering; });

            // act
            using (new SiteContextSwitcher(site))
            {
                sut.Process(ref args);
            }

            // assert
            sitecoreItem.Versions.Received(1).GetVersions(false);

            disableFiltering.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldAggregateValidRanges(
            PopulateItemVersions sut,
            List<FakeItem> versions,
            DateTime publishDate)
        {
            // arrange
            var sitecoreVersions = versions.Select(fake =>
            {
                fake.WithItemVersions();
                fake.WithPublishing();
                fake.WithStatistics();

                var scItem = fake.ToSitecoreItem();

                scItem.Publishing.ValidFrom.Returns(publishDate);
                scItem.Publishing.ValidTo.Returns(publishDate.AddYears(1));

                scItem.Publishing.HideVersion.ReturnsFalse();

                return scItem;
            }).ToArray();

            var sitecoreItem = sitecoreVersions.First();

            sitecoreItem.Versions.Configure().GetVersions(false).Returns(sitecoreVersions);

            var args = PopulateRawTimelineMetadataArgs.Create(sitecoreItem);

            // act
            sut.Process(ref args);

            // assert
            args.Metadata.RawItemPublishingRanges.Should().HaveCount(versions.Count);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipVersionWithHideMark(
            PopulateItemVersions sut,
            List<FakeItem> versions,
            DateTime publishDate)
        {
            // arrange
            var sitecoreVersions = versions.Select(fake =>
            {
                fake.WithItemVersions();
                fake.WithPublishing();

                var scItem = fake.ToSitecoreItem();

                scItem.Publishing.HideVersion.ReturnsTrue();

                return scItem;
            }).ToArray();

            var sitecoreItem = sitecoreVersions.First();

            sitecoreItem.Versions.Configure().GetVersions(false).Returns(sitecoreVersions);

            var args = PopulateRawTimelineMetadataArgs.Create(sitecoreItem);

            // act
            sut.Process(ref args);

            // assert
            args.Metadata.RawItemPublishingRanges.Should().BeEmpty();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipVersionWithInvalidRange(
            PopulateItemVersions sut,
            List<FakeItem> versions,
            DateTime publishDate)
        {
            // arrange
            var sitecoreVersions = versions.Select(fake =>
            {
                fake.WithItemVersions();
                fake.WithPublishing();
                fake.WithStatistics();

                var scItem = fake.ToSitecoreItem();

                scItem.Publishing.ValidFrom.Returns(publishDate);
                scItem.Publishing.ValidTo.Returns(publishDate.AddDays(-1));

                scItem.Publishing.HideVersion.ReturnsFalse();

                return scItem;
            }).ToArray();

            var sitecoreItem = sitecoreVersions.First();

            sitecoreItem.Versions.Configure().GetVersions(false).Returns(sitecoreVersions);

            var args = PopulateRawTimelineMetadataArgs.Create(sitecoreItem);

            // act
            sut.Process(ref args);

            // assert
            args.Metadata.RawItemPublishingRanges.Should().BeEmpty();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldUserCreatedDateWhenValidFromIsNotSpecified(
            PopulateItemVersions sut,
            FakeItem item,
            FakeItem version,
            DateTime publishDate)
        {
            // arrange
            var unpublishDate = publishDate.AddYears(1);

            item.WithItemVersions();

            version.WithItemVersions();
            version.WithPublishing();
            version.WithStatistics();

            var scItem = version.ToSitecoreItem();

            scItem.Statistics.Created.Returns(publishDate);
            scItem.Publishing.ValidTo.Returns(publishDate.AddYears(1));

            scItem.Publishing.HideVersion.ReturnsFalse();

            var sitecoreItem = item.ToSitecoreItem();

            sitecoreItem.Versions.Configure().GetVersions(false).Returns(new[]
            {
                scItem
            });

            var args = PopulateRawTimelineMetadataArgs.Create(sitecoreItem);

            // act
            sut.Process(ref args);

            // assert
            var ranges = args.Metadata.RawItemPublishingRanges;

            ranges.Should().HaveCount(1);
            ranges.Should().Contain(x => x.Range == new PublishingRange(publishDate, unpublishDate));
        }
    }
}
