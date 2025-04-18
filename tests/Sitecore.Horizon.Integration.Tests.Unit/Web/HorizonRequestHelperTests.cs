// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites;
using Sitecore.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Web
{
    public class HorizonRequestHelperTests
    {
        [Theory]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "api", HorizonMode.Api)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "editor", HorizonMode.Editor)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "preview", HorizonMode.Preview)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "0", HorizonMode.Disabled)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "bla", HorizonMode.Disabled)]
        [InlineAutoNData("key", "value", HorizonMode.Disabled)]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldSupportModeValueInQueryString(
            string key,
            string value,
            HorizonMode mode,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.QueryString[key] = value;

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.Mode.Should().Be(mode);
        }

        [Theory]
        [InlineAutoNData("api", "local", "local")]
        [InlineAutoNData("editor", "staging", "staging")]
        [InlineAutoNData("preview", "production", "production")]
        [InlineAutoNData("0", "local", null)]
        [InlineAutoNData("bla", "dev", null)]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldGetEnvValueFromQueryStringIfHorizonIsNotDisabled(
            string mode,
            string envValue,
            string expectedEnvValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.QueryString[HorizonRequestHelper.HorizonHostKey] = envValue;
            context.Request.QueryString[HorizonRequestHelper.HorizonModeKey] = mode;

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.HorizonHost.Should().Be(expectedEnvValue);
        }

        [Theory]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "api", HorizonMode.Api)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "editor", HorizonMode.Editor)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "preview", HorizonMode.Preview)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "0", HorizonMode.Disabled)]
        [InlineAutoNData(HorizonRequestHelper.HorizonModeKey, "", HorizonMode.Disabled)]
        [InlineAutoNData("key", "value", HorizonMode.Disabled)]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldSupportModeValueInCookies(
            string key,
            string value,
            HorizonMode mode,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.Cookies.Add(new HttpCookie(key, value));

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.Mode.Should().Be(mode);
        }

        [Theory]
        [InlineAutoNData("editor", "local", "local")]
        [InlineAutoNData("preview", "staging", "staging")]
        [InlineAutoNData("bla", "staging", null)]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldSupportEnvValueInCookiesIfHorizonIsNotDisabled(
            string mode,
            string envValue,
            string expectedEnvValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonModeKey, mode));
            context.Request.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonHostKey, envValue));

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.HorizonHost.Should().Be(expectedEnvValue);
        }

        [Theory]
        [InlineAutoNData("editor", "editor", HorizonMode.Editor)]
        [InlineAutoNData("editor", "0", HorizonMode.Editor)]
        [InlineAutoNData("0", "editor", HorizonMode.Disabled)]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldPreferValueFromQueryString(
            string queryStringValue,
            string cookieValue,
            HorizonMode mode,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.QueryString[HorizonRequestHelper.HorizonModeKey] = queryStringValue;
            context.Request.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonModeKey, cookieValue));

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.Mode.Should().Be(mode);
        }

        [Theory]
        [InlineAutoNData("local", "local")]
        [InlineAutoNData("local", "0")]
        [InlineAutoNData("0", "local")]
        internal void GetHorizonRequestStateFromQueryStringOrCookie_ShouldPreferCanvasEnvValueFromQueryString(
            string queryStringValue,
            string cookieValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // arrange
            context.Request.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonModeKey, "editor"));
            context.Request.QueryString[HorizonRequestHelper.HorizonHostKey] = queryStringValue;
            context.Request.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonHostKey, cookieValue));

            // act
            var result = sut.GetHorizonRequestStateFromQueryStringOrCookie(context);

            // assert
            result.HorizonHost.Should().Be(queryStringValue);
        }

        [Theory]
        [AutoNData]
        internal void SetHorizonModeCookie_ShouldMakeCookieOutdatedWhenValueIsFalse(HorizonRequestHelper sut, HttpContextBase context)
        {
            // arrange
            context.Response.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonModeKey, "editor"));
            context.Response.Cookies.Add(new HttpCookie(HorizonRequestHelper.HorizonHostKey, "staging"));

            // act
            sut.SetHorizonModeCookie(context, new HorizonRequestState(HorizonMode.Disabled, null));

            // assert
            HttpCookie modeCookie = context.Response.Cookies[HorizonRequestHelper.HorizonModeKey];
            HttpCookie envCookie = context.Response.Cookies[HorizonRequestHelper.HorizonHostKey];

            modeCookie.Should().NotBeNull();
            modeCookie.Expires.Should().BeBefore(DateTime.UtcNow);
            envCookie.Should().NotBeNull();
            envCookie.Expires.Should().BeBefore(DateTime.UtcNow);
        }

        [Theory]
        [InlineAutoNData(HorizonMode.Api, "api")]
        [InlineAutoNData(HorizonMode.Editor, "editor")]
        [InlineAutoNData(HorizonMode.Preview, "preview")]
        internal void SetHorizonModeCookie_ShouldSetCookieIfValueIsTrue(
            HorizonMode mode,
            string expectedCookieValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {

            // act
            sut.SetHorizonModeCookie(context, new HorizonRequestState(mode, null));

            // assert
            HttpCookie cookie = context.Response.Cookies[HorizonRequestHelper.HorizonModeKey];

            cookie.Should().NotBeNull();
            cookie.Value.Should().Be(expectedCookieValue);
        }

        [Theory]
        [AutoNData]
        internal void SetHorizonModeCookie_ShouldSetCanvasEnvCookieIfValueIsTrue(
            HorizonMode mode,
            string envValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {

            // act
            sut.SetHorizonModeCookie(context, new HorizonRequestState(mode, envValue));

            // assert
            HttpCookie cookie = context.Response.Cookies[HorizonRequestHelper.HorizonHostKey];

            cookie.Should().NotBeNull();
            cookie.Value.Should().Be(envValue);
        }

        [Theory]
        [InlineAutoNData(HorizonMode.Api)]
        [InlineAutoNData(HorizonMode.Editor)]
        [InlineAutoNData(HorizonMode.Preview)]
        internal void SetHorizonModeCookie_ShouldSetCookieSameSiteToNoneAndSecure(
            HorizonMode mode,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // act
            sut.SetHorizonModeCookie(context, new HorizonRequestState(mode, null));

            // assert
            HttpCookie cookie = context.Response.Cookies[HorizonRequestHelper.HorizonModeKey];
            cookie.Should().NotBeNull();
            cookie.Secure.Should().BeTrue();
            cookie.SameSite.Should().Be(SameSiteMode.None);
        }

        [Theory]
        [AutoNData]
        internal void SetHorizonModeCookie_ShouldSetCanvasEnvCookieSameSiteToNoneAndSecure(
            HorizonMode mode,
            string envValue,
            HorizonRequestHelper sut,
            HttpContextBase context)
        {
            // act
            sut.SetHorizonModeCookie(context, new HorizonRequestState(mode, envValue));

            // assert
            HttpCookie cookie = context.Response.Cookies[HorizonRequestHelper.HorizonHostKey];
            cookie.Should().NotBeNull();
            cookie.Secure.Should().BeTrue();
            cookie.SameSite.Should().Be(SameSiteMode.None);
        }

        [Theory]
        [AutoNData]
        internal void RedirectToLoginPageIfApplicable_ShouldRedirectToLoginPageWithReturnUrl(
            [Frozen] BaseSiteContextFactory siteContextFactory,
            HorizonRequestHelper sut,
            HttpContextBase context,
            SiteContext site,
            string url)
        {
            // arrange
            context.Request.RawUrl.Returns(url);

            siteContextFactory.Configure().GetSiteContext(Constants.ShellSiteName).Returns(site);

            // act
            sut.RedirectToLoginPageIfApplicable(context);

            // assert
            context.Response.Received().Redirect($"{site.LoginPage}?returnUrl={WebUtil.UriEscapeDataString(context.Request.RawUrl)}");
        }

        [Theory]
        [AutoNData]
        internal void RedirectToLoginPageIfApplicable_ShouldNotRedirectIfAjaxRequest(
            [Frozen] BaseSiteContextFactory siteContextFactory,
            HorizonRequestHelper sut,
            HttpContextBase context,
            SiteContext site)
        {
            // arrange
            // Make the 'IsAjaxRequest' extension method return 'true'.
            context.Request["X-Requested-With"].Returns("XMLHttpRequest");

            siteContextFactory.Configure().GetSiteContext(Constants.ShellSiteName).Returns(site);

            // act
            sut.RedirectToLoginPageIfApplicable(context);

            // assert
            context.Response.DidNotReceive().Redirect(Any.String);
        }

        [Theory]
        [AutoNData]
        internal void RedirectToLoginPageIfApplicable_ShouldThrowWhenLoginPageIsNotSpecified(
            [Frozen] BaseSiteContextFactory siteContextFactory,
            HorizonRequestHelper sut,
            HttpContextBase context,
            SiteContext site)
        {
            // arrange
            site.LoginPage.Returns(string.Empty);
            siteContextFactory.Configure().GetSiteContext(Constants.ShellSiteName).Returns(site);

            // act
            // assert
            sut.Invoking(x => x.RedirectToLoginPageIfApplicable(context)).Should().Throw<InvalidOperationException>();
        }
    }
}
