// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using FluentAssertions;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Publishing;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Publishing
{
    public class PublishingCheckerTests
    {
        [Theory]
        [AutoNData]
        internal void GetItemPublishingInfo_ShouldReturnIsPublishableTrue(
            FakeItem item,
            FakeItem validVersion,
            PublishingChecker sut
        )
        {
            //arrange
            item.WithPublishing();
            Item sitecoreItem = item.ToSitecoreItem();
            Item sitecoreValidItem = validVersion.ToSitecoreItem();
            sitecoreItem.Publishing.GetValidVersion(Arg.Any<DateTime>(), Any.Bool).Returns(sitecoreValidItem);
            sitecoreItem.Publishing.IsPublishable(Arg.Any<DateTime>(), Any.Bool).Returns(true);
            sitecoreItem.Publishing.NeverPublish.Returns(false);

            //act
            ItemPublishingInfo info = sut.GetItemPublishingInfo(item);

            //assert
            info.IsPublishable.Should().BeTrue();
            info.HasPublishableVersion.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void GetItemPublishingInfo_ShouldReturnIsPublishableFalse(
            FakeItem item,
            FakeItem validVersion,
            PublishingChecker sut
        )
        {
            //arrange
            item.WithPublishing();
            Item sitecoreItem = item.ToSitecoreItem();
            Item sitecoreValidItem = validVersion.ToSitecoreItem();
            sitecoreItem.Publishing.GetValidVersion(Arg.Any<DateTime>(), Any.Bool).Returns(sitecoreValidItem);
            sitecoreItem.Publishing.IsPublishable(Arg.Any<DateTime>(), Any.Bool).Returns(true);
            sitecoreItem.Publishing.NeverPublish.Returns(true);

            //act
            ItemPublishingInfo info = sut.GetItemPublishingInfo(item);

            //assert
            info.IsPublishable.Should().BeFalse();
            info.HasPublishableVersion.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void GetItemPublishingInfo_ShouldReturnHasPublishableVersionFalse(
            FakeItem item,
            PublishingChecker sut
        )
        {
            //arrange
            item.WithPublishing();
            Item sitecoreItem = item.ToSitecoreItem();
            sitecoreItem.Publishing.GetValidVersion(Arg.Any<DateTime>(), Any.Bool).Returns((Item)null);
            sitecoreItem.Publishing.IsPublishable(Arg.Any<DateTime>(), Any.Bool).Returns(true);
            sitecoreItem.Publishing.NeverPublish.Returns(false);

            //act
            ItemPublishingInfo info = sut.GetItemPublishingInfo(item);

            //assert
            info.IsPublishable.Should().BeTrue();
            info.HasPublishableVersion.Should().BeFalse();
        }
    }
}
