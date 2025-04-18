// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.LaunchPad;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.LaunchPad
{
    public class HorizonHostResolverTests
    {
        [Theory]
        [InlineAutoNData("https://host.com/", "startpage/page", "tenantName")]
        [InlineAutoNData("https://host.com", "startpage/page", "tenantName")]
        [InlineAutoNData("https://host.com/", "/startpage/page", "tenantName")]
        internal void Execute_ShouldReturnHostUrlFromSettingsRespectingPathAndHost(
            string host,
            string startPage,
            string tenantName,
            [Frozen] BaseSettings settings,
            [Frozen] ISitecoreContextHelper contextHelper,
            [Greedy] HorizonHostResolver sut)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(host);
            settings.Horizon().ClientHostStartPage.Returns(startPage);
            settings.Horizon().PlatformTenantName.Returns(tenantName);

            contextHelper.Configure().Context.HttpContext.ReturnsNull();

            // act
            string result = sut.Execute();

            // assert
            result.Should().Be($"https://host.com/startpage/page?tenantName={tenantName}");
        }


        [Theory]
        [InlineAutoNData("host.com", "startpage/page")]
        [InlineAutoNData("", "startpage/page")]
        [InlineAutoNData("https://host.com/", "")]
        internal void Execute_ShouldNotThrowException(
           string host,
           string startPage,
           [Frozen] BaseSettings settings,
           [Frozen] ISitecoreContextHelper contextHelper,
           [Greedy] HorizonHostResolver sut)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(host);
            settings.Horizon().ClientHostStartPage.Returns(startPage);

            contextHelper.Configure().Context.HttpContext.ReturnsNull();

            // act && assert
            sut.Invoking(x => x.Execute()).Should().NotThrow();
        }

        [Theory]
        [InlineAutoNData("https://host.com", "/startpage/page")]
        internal void Execute_ShouldReturnUrlWithSiteWhenCanMatchSiteByHost(
            string host,
            string startPage,
            [Frozen] BaseSettings settings,
            [Frozen] ISitecoreContextHelper contextHelper,
            [Frozen] IHorizonSiteManager siteManager,
            [Greedy] HorizonHostResolver sut,
            [Frozen] HttpContextBase httpContext,
             Uri uri,
            string matchedSite)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(host);
            settings.Horizon().ClientHostStartPage.Returns(startPage);
            httpContext.Request.Url.Returns(uri);
            contextHelper.Configure().Context.HttpContext.Returns(httpContext);

            siteManager.TryBestMatchClientSiteByHost(uri.Host).Returns(matchedSite);

            // act
            string result = sut.Execute();

            // assert
            result.Should().Contain($"sc_site={matchedSite}");
        }

        [Theory]
        [InlineAutoNData("https://host.com", "/startpage/page")]
        internal void Execute_ShouldReturnHostUrlWithoutSiteWhenUnableToFindSiteByHost(
            string host,
            string startPage,
            [Frozen] BaseSettings settings,
            [Frozen] ISitecoreContextHelper contextHelper,
            [Frozen] IHorizonSiteManager siteManager,
            [Greedy] HorizonHostResolver sut,
            HttpContextBase httpContext, Uri uri)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(host);
            settings.Horizon().ClientHostStartPage.Returns(startPage);

            httpContext.Request.Url.Returns(uri);
            contextHelper.Configure().Context.HttpContext.Returns(httpContext);

            siteManager.TryBestMatchClientSiteByHost(Any.String).ReturnsNull();

            // act
            string result = sut.Execute();

            // assert
            result.Should().NotContain("?sc_site");
        }
    }
}
