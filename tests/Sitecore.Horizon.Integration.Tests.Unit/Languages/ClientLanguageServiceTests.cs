// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.AutoNSubstitute;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Languages
{
    public class ClientLanguageServiceTests
    {
        [Theory]
        [AutoNData]
        internal void GetClientLanguage_ShouldReturnUserClientLanguageWhenUserHasDefinedClientLanguage(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            ClientLanguageService sut,
            [Substitute] UserProfile userProfile,
            string userClientLanguage)
        {
            // arrange
            sitecoreContextHelper.Context.User.Configure().Profile.Returns(userProfile);
            userProfile.ClientLanguage.Returns(userClientLanguage);

            // act
            string language = sut.GetClientLanguage();

            // assert
            language.Should().Be(userClientLanguage);
        }

        [Theory]
        [AutoNData]
        internal void GetClientLanguage_ShouldReturnDefaultLanguageWhenUserHasNoDefinedClientLanguage(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] BaseSettings settings,
            ClientLanguageService sut,
            [Substitute] UserProfile userProfile,
            string defaultLanguage
        )
        {
            // arrange
            sitecoreContextHelper.Context.User.Configure().Profile.Returns(userProfile);
            userProfile.ClientLanguage.Returns(string.Empty);
            settings.Configure().Core().ClientLanguage.Returns(defaultLanguage);

            // act
            string language = sut.GetClientLanguage();

            // assert
            language.Should().Be(defaultLanguage);
        }

        [Theory]
        [AutoNData]
        internal void ApplyClientLanguage_ShouldApplyLanguageForShellSite(
            [Frozen] IHorizonSiteManager horizonSiteManager,
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] BaseLanguageManager languageManager,
            ClientLanguageService sut,
            [Substitute] Language objLanguage,
            string strLanguage,
            SiteContext shellSite,
            string shellSiteName,
            [Substitute] UserProfile userProfile)
        {
            // arrange
            sitecoreContextHelper.Context.User.Configure().Profile.Returns(userProfile);
            userProfile.ClientLanguage.Returns(strLanguage);

            shellSite.Name.Returns(shellSiteName);
            horizonSiteManager.Configure().GetSiteByName(Constants.ShellSiteName).Returns(shellSite);
            objLanguage.Name.Returns(strLanguage);
            languageManager.GetLanguage(strLanguage).Returns(objLanguage);

            // act
            sut.ApplyClientLanguage();

            // assert
            sitecoreContextHelper.Context.Received().SetLanguage(objLanguage, true, shellSite);
        }

        [Theory]
        [AutoNData]
        internal void ApplyClientLanguage_ShouldNotApplyWhenLanguageIsEmptyString(
            [Frozen] BaseSettings settings,
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            ClientLanguageService sut,
            ISitecoreContext sitecoreContext,
            [Substitute] UserProfile userProfile)
        {
            // arrange
            sitecoreContextHelper.Context.User.Configure().Profile.Returns(userProfile);
            userProfile.ClientLanguage.Returns(string.Empty);
            settings.Configure().Core().ClientLanguage.Returns(string.Empty);

            // act
            sut.ApplyClientLanguage();

            // assert
            sitecoreContextHelper.Context.DidNotReceive().SetLanguage(Arg.Any<Language>(), Any.Bool, Arg.Any<SiteContext>());
        }

        [Theory]
        [AutoNData]
        internal void ApplyClientLanguage_ShouldNotApplyWhenShellSiteIsNull(
            [Frozen] IHorizonSiteManager horizonSiteManager,
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            ClientLanguageService sut,
            string strLanguage,
            [Substitute] UserProfile userProfile)
        {
            // arrange
            sitecoreContextHelper.Context.User.Configure().Profile.Returns(userProfile);
            userProfile.ClientLanguage.Returns(strLanguage);
            horizonSiteManager.Configure().GetSiteByName(Constants.ShellSiteName).ReturnsNull();

            // act
            sut.ApplyClientLanguage();

            // assert
            sitecoreContextHelper.Context.DidNotReceive().SetLanguage(Arg.Any<Language>(), Any.Bool, Arg.Any<SiteContext>());
        }
    }
}
