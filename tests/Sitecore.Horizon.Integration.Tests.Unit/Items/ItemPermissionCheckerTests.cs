// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.NSubstituteUtils;
using Sitecore.Security.Accounts;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Items
{
    public class ItemPermissionCheckerTests
    {
        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanWrite_ShouldDelegateToItemSecurity(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithSecurity().ToSitecoreItem();
            sitecoreItem.Security.CanWrite(user).Returns(expected);

            // act
            bool result = sut.CanWrite(item, user);

            // assert
            sitecoreItem.Security.Received(1).CanWrite(user);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanDelete_ShouldDelegateToItemSecurity(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithSecurity().ToSitecoreItem();
            sitecoreItem.Security.CanDelete(user).Returns(expected);

            // act
            bool result = sut.CanDelete(item, user);

            // assert
            sitecoreItem.Security.Received(1).CanDelete(user);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanRename_ShouldDelegateToItemSecurity(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithSecurity().ToSitecoreItem();
            sitecoreItem.Security.CanRename(user).Returns(expected);

            // act
            bool result = sut.CanRename(item, user);

            // assert
            sitecoreItem.Security.Received(1).CanRename(user);
            result.Should().Be(expected);
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanCreate_ShouldDelegateToItemSecurity(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithSecurity().ToSitecoreItem();
            sitecoreItem.Security.CanCreate(user).Returns(expected);

            // act
            bool result = sut.CanCreate(item, user);

            // assert
            sitecoreItem.Security.Received(1).CanCreate(user);
            result.Should().Be(expected);
        }

        [Theory]
        [AutoNData]
        internal void CanPublish_ShouldReturnFalseWhenPublishingDisabled(
            FakeItem item,
            User user,
            [Frozen] ISitecoreLegacySettings legacySettings,
            ItemPermissionChecker sut)
        {
            // arrange
            legacySettings.PublishingEnabled.ReturnsFalse();

            // act
            bool result = sut.CanPublish(item, user);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void CanPublish_ShouldReturnFalseWhenUserDoesNotHavePublishingRole(
            FakeItem item,
            User user,
            [Frozen] ISitecoreLegacySettings legacySettings,
            ItemPermissionChecker sut)
        {
            // arrange
            legacySettings.PublishingEnabled.ReturnsTrue();
            user.IsAdministrator.ReturnsFalse();
            user.IsInRole(Any.String).ReturnsFalse();

            // act
            bool result = sut.CanPublish(item, user);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void CanPublish_ShouldReturnTrueWhenUserIsAdmin(
            FakeItem item,
            User user,
            [Frozen] ISitecoreLegacySettings legacySettings,
            ItemPermissionChecker sut)
        {
            // arrange
            legacySettings.PublishingEnabled.ReturnsTrue();
            user.IsAdministrator.ReturnsTrue();

            // act
            bool result = sut.CanPublish(item, user);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanUnlock_ShouldReturnTrueWhenUserHasLock(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithItemLocking().ToSitecoreItem();
            sitecoreItem.Locking.HasLock().ReturnsTrue();

            // act
            bool result = sut.CanUnlock(item, user);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanUnlock_ShouldReturnTrueWhenUserIsAdmin(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithItemLocking().ToSitecoreItem();
            sitecoreItem.Locking.HasLock().ReturnsFalse();

            user.IsAdministrator.ReturnsTrue();

            // act
            bool result = sut.CanUnlock(item, user);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void CanUnlock_ShouldReturnFalseForCommonUserWithoutOwnLock(bool expected, FakeItem item, User user, ItemPermissionChecker sut)
        {
            // arrange
            Item sitecoreItem = item.WithItemLocking().ToSitecoreItem();
            sitecoreItem.Locking.HasLock().ReturnsFalse();

            user.IsAdministrator.ReturnsFalse();

            // act
            bool result = sut.CanUnlock(item, user);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void CanWriteItemLanguage_ShouldReturnTrueIfUserIsAdmin(FakeItem item, User user, Database database, ItemPermissionChecker sut)
        {
            //arrange
            user.IsAdministrator.ReturnsTrue();

            //act
            bool result = sut.CanWriteItemLanguage(item, user);

            //assert
            result.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void CanWriteItemLanguage_ShouldReturnFalseIfLanguageNull(FakeItem item,
            User user,
            Database database,
            [Frozen] BaseLanguageManager languageManager,
            [Frozen] BaseSettings settings,
            ItemPermissionChecker sut)
        {
            //arrange
            user.IsAdministrator.ReturnsFalse();
            settings.Core().CheckSecurityOnLanguages.ReturnsTrue();
            languageManager.GetLanguageItem(Arg.Any<Language>(), Arg.Any<Database>()).ReturnsNull();

            //act
            bool result = sut.CanWriteItemLanguage(item, user);

            //assert
            result.Should().BeFalse();
        }
    }
}
