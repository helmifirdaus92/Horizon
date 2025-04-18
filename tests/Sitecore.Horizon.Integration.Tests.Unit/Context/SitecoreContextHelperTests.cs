// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security.Accounts;
using Sitecore.Security.Domains;
using Sitecore.Sites;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Context
{
    public class SitecoreContextHelperTests : IDisposable
    {
        public void Dispose()
        {
            Thread.CurrentPrincipal = null;
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldThrowWhenContextSiteIsNull(SitecoreContextHelper sut)
        {
            // arrange

            // act
            // assert
            sut.Invoking(x => x.TryEnableDisplayMode(null, DisplayMode.Edit)).Should().Throw<ArgumentNullException>();
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldSetDisplayModeIfNeeded(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            // act
            sut.TryEnableDisplayMode(site, DisplayMode.Edit);

            // assert
            sitecoreContext.Received().SetDisplayMode(site, DisplayMode.Edit, DisplayModeDuration.Remember);
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldSkipWhenDisplayModeIsRequestedAlready(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site,
            DisplayMode displayMode)
        {
            // arrange
            site.DisplayMode.Returns(displayMode);

            // act
            sut.TryEnableDisplayMode(site, displayMode);

            // assert
            sitecoreContext.DidNotReceive().SetDisplayMode(Arg.Any<SiteContext>(), Arg.Any<DisplayMode>(), Arg.Any<DisplayModeDuration>());
        }

        [Theory]
        [InlineAutoNData(DisplayMode.Normal)]
        [InlineAutoNData(DisplayMode.Edit)]
        [InlineAutoNData(DisplayMode.Preview)]
        internal void TryEnableDisplayMode_ShouldReturnTrueWhenDisplayModeIsTheSameAlready(
            DisplayMode displayMode,
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(displayMode);

            // act
            bool result = sut.TryEnableDisplayMode(site, displayMode);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldReturnTrueWhenFinalDisplayModeSameAsRequested(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site,
            DisplayMode displayMode)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal, displayMode);

            // act
            bool result = sut.TryEnableDisplayMode(site, displayMode);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldReturnFalseWhenFinalDisplayModeNotSameAsRequested(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site,
            DisplayMode requestedMode,
            DisplayMode finalMode)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal, requestedMode);

            // act
            bool result = sut.TryEnableDisplayMode(site, finalMode);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ResetsUserIfIncorrectDomain(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseAuthenticationManager authenticationManager,
            SitecoreContextHelper sut,
            SiteContext site,
            HttpContextBase httpContext,
            User initialUser,
            User reinitializedUser)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            initialUser.IsAuthenticated.ReturnsFalse();

            sitecoreContext.Configure().User.Returns(initialUser, reinitializedUser);
            sitecoreContext.Configure().Site.Returns(site);
            sitecoreContext.Configure().HttpContext.Returns(httpContext);

            httpContext.User = initialUser;
            Thread.CurrentPrincipal = initialUser;

            // act
            sut.TryEnableDisplayMode(site, DisplayMode.Preview);

            // assert
            httpContext.User.Should().BeNull();
            Thread.CurrentPrincipal.Identity.Name.Should().BeEmpty();

            authenticationManager.Received().SetActiveUser(reinitializedUser);
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldNotReinitializeContextUserIfAuthenticated(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseAuthenticationManager authenticationManager,
            SitecoreContextHelper sut,
            HttpContextBase httpContext,
            SiteContext site,
            User initialUser,
            User reinitializedUser)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            initialUser.IsAuthenticated.ReturnsTrue();

            sitecoreContext.Configure().User.Returns(initialUser, reinitializedUser);
            sitecoreContext.Configure().Site.Returns(site);
            sitecoreContext.Configure().HttpContext.Returns(httpContext);

            httpContext.User = initialUser;
            Thread.CurrentPrincipal = initialUser;

            // act
            sut.TryEnableDisplayMode(site, DisplayMode.Preview);

            // assert
            httpContext.User.Should().BeSameAs(initialUser);
            Thread.CurrentPrincipal.Should().BeSameAs(initialUser);

            authenticationManager.DidNotReceive().SetActiveUser(Any.Arg<User>());
        }

        [Theory]
        [AutoNData]
        internal void TryEnableDisplayMode_ShouldNotReinitializeContextUserIfDomainTheSameWithContextSite(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] BaseAuthenticationManager authenticationManager,
            SitecoreContextHelper sut,
            HttpContextBase httpContext,
            SiteContext site,
            Domain domain,
            User initialUser,
            User reinitializedUser)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            initialUser.IsAuthenticated.ReturnsFalse();
            initialUser.Domain.Returns(domain);
            site.Domain.Returns(domain);

            sitecoreContext.Configure().User.Returns(initialUser, reinitializedUser);
            sitecoreContext.Configure().Site.Returns(site);
            sitecoreContext.Configure().HttpContext.Returns(httpContext);

            httpContext.User = initialUser;
            Thread.CurrentPrincipal = initialUser;

            // act
            sut.TryEnableDisplayMode(site, DisplayMode.Preview);

            // assert
            httpContext.User.Should().BeSameAs(initialUser);
            Thread.CurrentPrincipal.Should().BeSameAs(initialUser);

            authenticationManager.DidNotReceive().SetActiveUser(Any.Arg<User>());
        }

        [Theory]
        [AutoNData]
        internal void ResetDisplayModeForRequest_ShouldSetNormalDisplayModeForRequest(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Edit);

            // act
            sut.ResetDisplayModeForRequest(site);

            // assert
            sitecoreContext.Received().SetDisplayMode(site, DisplayMode.Normal, DisplayModeDuration.Temporary);
        }

        [Theory]
        [AutoNData]
        internal void ResetDisplayModeForRequest_ShouldSkipWhenAlreadyNormalDisplayMode(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            // act
            sut.ResetDisplayModeForRequest(site);

            // assert
            sitecoreContext.DidNotReceive().SetDisplayMode(Arg.Any<SiteContext>(), DisplayMode.Normal, Arg.Any<DisplayModeDuration>());
        }

        [Theory]
        [AutoNData]
        internal void EnablePreviewForUnpublishableItems_ShouldEnablePreviewUnpublishableItemsForPreviewMode(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Preview);

            // act
            sut.EnablePreviewForUnpublishableItems(site);

            // assert
            sitecoreContext.Received().EnablePreviewForUnpublishableItems(site);
        }

        [Theory]
        [AutoNData]
        internal void EnablePreviewForUnpublishableItems_ShouldSkipEnablePreviewUnpublishableItemsForNonPreviewMode(
            [Frozen] ISitecoreContext sitecoreContext,
            SitecoreContextHelper sut,
            SiteContext site)
        {
            // arrange
            site.DisplayMode.Returns(DisplayMode.Normal);

            // act
            sut.EnablePreviewForUnpublishableItems(site);

            // assert
            sitecoreContext.DidNotReceive().EnablePreviewForUnpublishableItems(Arg.Any<SiteContext>());
        }
    }
}
