// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.NSubstituteUtils;
using Sitecore.Security.AccessControl;
using Sitecore.Security.Accounts;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Languages
{
    public class LanguageRepositoryTests
    {
        [Theory, AutoNData]
        internal void GetLanguages_ShouldReturnLanguages(
            [Frozen] BaseLanguageManager baseLanguageManager,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [NoAutoProperties] LanguageRepository sut,
            Item languageItem
        )
        {
            // arrange
            var languages = new LanguageCollection()
            {
                Language.Parse("en"),
                Language.Parse("da")
            };

            languageItem.AsFake().WithAppearance();
            languageItem.Appearance.Hidden.ReturnsFalse();

            context.Database.GetItem(Any.ID).Returns(languageItem);

            baseLanguageManager.Configure().GetLanguages(context.Database).Returns(languages);
            settings.Core().CheckSecurityOnLanguages.ReturnsFalse();

            // act
            var result = sut.GetLanguages();

            // assert
            result.Should().Contain(languages);
        }

        [Theory, AutoNData]
        internal void GetLanguages_ShouldExcludeLanguageIfLanguageItemIdEmpty(
            [Frozen] BaseLanguageManager baseLanguageManager,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [NoAutoProperties] LanguageRepository sut,
            Item languageItem
        )
        {
            // arrange
            var enLanguage = Language.Parse("en");
            var daLanguage = Language.Parse("da");
            var languages = new LanguageCollection()
            {
                enLanguage,
                daLanguage
            };

            languageItem.AsFake().WithAppearance();
            languageItem.Appearance.Hidden.ReturnsFalse();

            context.Database.GetItem(Any.ID).Returns(languageItem);

            baseLanguageManager.Configure().GetLanguages(context.Database).Returns(languages);
            baseLanguageManager.Configure().GetLanguageItemId(daLanguage, context.Database).Returns(ID.Null);

            settings.Core().CheckSecurityOnLanguages.ReturnsFalse();

            // act
            var result = sut.GetLanguages();

            // assert
            result.Should().HaveCount(1);
            result.Should().Contain(enLanguage);
            result.Should().NotContain(daLanguage);
        }

        [Theory, AutoNData]
        internal void GetLanguages_ShouldExcludeLanguageIfNoAccessToLanguageItem(
            [Frozen] BaseLanguageManager baseLanguageManager,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [NoAutoProperties] LanguageRepository sut,
            Item languageItem,
            ID languageItemId
        )
        {
            // arrange
            var enLanguage = Language.Parse("en");
            var daLanguage = Language.Parse("da");
            var languages = new LanguageCollection()
            {
                enLanguage,
                daLanguage
            };

            languageItem.AsFake().WithAppearance();
            languageItem.Appearance.Hidden.ReturnsFalse();

            context.Database.GetItem(Any.ID).Returns(languageItem);

            baseLanguageManager.Configure().GetLanguages(context.Database).Returns(languages);
            baseLanguageManager.Configure().GetLanguageItemId(daLanguage, context.Database).Returns(languageItemId);
            context.Database.GetItem(languageItemId).Returns((Item)null);

            settings.Core().CheckSecurityOnLanguages.ReturnsFalse();

            // act
            var result = sut.GetLanguages();

            // assert
            result.Should().HaveCount(1);
            result.Should().Contain(enLanguage);
            result.Should().NotContain(daLanguage);
        }

        [Theory, AutoNData]
        internal void GetLanguages_ShouldExcludeLanguageIfLanguageItemIsHidden(
            [Frozen] BaseLanguageManager baseLanguageManager,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [NoAutoProperties] LanguageRepository sut,
            ID enLanguageItemId,
            ID daLanguageItemId
        )
        {
            // arrange
            var enLanguage = Language.Parse("en");
            var daLanguage = Language.Parse("da");
            var languages = new LanguageCollection()
            {
                enLanguage,
                daLanguage
            };

            var enLanguageItem = new FakeItem(enLanguageItemId, context.Database)
                .WithAppearance()
                .ToSitecoreItem();

            enLanguageItem.Appearance.Hidden.ReturnsFalse();

            var daLanguageItem = new FakeItem(enLanguageItemId, context.Database)
                .WithAppearance()
                .ToSitecoreItem();

            daLanguageItem.Appearance.Hidden.ReturnsTrue();

            baseLanguageManager.Configure().GetLanguages(context.Database).Returns(languages);

            context.Database.GetItem(enLanguageItemId).Returns(enLanguageItem);
            context.Database.GetItem(daLanguageItemId).Returns(daLanguageItem);

            baseLanguageManager.Configure().GetLanguageItemId(enLanguage, context.Database).Returns(enLanguageItemId);
            baseLanguageManager.Configure().GetLanguageItemId(daLanguage, context.Database).Returns(daLanguageItemId);

            settings.Core().CheckSecurityOnLanguages.ReturnsFalse();

            // act
            var result = sut.GetLanguages();

            // assert
            result.Should().HaveCount(1);
            result.Should().Contain(enLanguage);
            result.Should().NotContain(daLanguage);
        }

        [Theory, AutoNData]
        internal void GetLanguages_ShouldExcludeLanguageIfNoLanguageReadPermission(
            [Frozen] BaseLanguageManager baseLanguageManager,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseAuthorizationManager authorizationManager,
            [Frozen] BaseAccessRightManager accessRightManager,
            [Frozen] BaseSettings settings,
            [NoAutoProperties] LanguageRepository sut,
            ID enLanguageItemId,
            ID daLanguageItemId
        )
        {
            // arrange
            var enLanguage = Language.Parse("en");
            var daLanguage = Language.Parse("da");
            var languages = new LanguageCollection()
            {
                enLanguage,
                daLanguage
            };

            var enLanguageItem = new FakeItem(enLanguageItemId, context.Database)
                .WithAppearance()
                .ToSitecoreItem();

            enLanguageItem.Appearance.Hidden.ReturnsFalse();

            var daLanguageItem = new FakeItem(enLanguageItemId, context.Database)
                .WithAppearance()
                .ToSitecoreItem();

            daLanguageItem.Appearance.Hidden.ReturnsFalse();

            baseLanguageManager.Configure().GetLanguages(context.Database).Returns(languages);

            context.Database.GetItem(enLanguageItemId).Returns(enLanguageItem);
            context.Database.GetItem(daLanguageItemId).Returns(daLanguageItem);

            baseLanguageManager.Configure().GetLanguageItemId(enLanguage, context.Database).Returns(enLanguageItemId);
            baseLanguageManager.Configure().GetLanguageItemId(daLanguage, context.Database).Returns(daLanguageItemId);

            settings.Core().CheckSecurityOnLanguages.ReturnsTrue();

            var languageReadAccessRight = new AccessRight(WellknownRights.LanguageRead);
            accessRightManager.GetAccessRight(WellknownRights.LanguageRead).Returns(languageReadAccessRight);
            authorizationManager.IsAllowed(daLanguageItem, languageReadAccessRight, Any.Arg<Account>()).ReturnsFalse();

            // act
            var result = sut.GetLanguages();

            // assert
            result.Should().HaveCount(1);
            result.Should().Contain(enLanguage);
            result.Should().NotContain(daLanguage);
        }
    }
}
