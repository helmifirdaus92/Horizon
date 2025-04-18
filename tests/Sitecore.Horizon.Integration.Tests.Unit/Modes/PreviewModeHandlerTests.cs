// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Modes;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Modes
{
    public class PreviewModeHandlerTests
    {
        [Theory]
        [AutoNData]
        internal void CanHandle_ShouldReturnTrueForPreviewMode(PreviewModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(HeadlessMode.Preview);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        internal void CanHandle_ShouldReturnFalseForNonPreviewModes(HeadlessMode mode, PreviewModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(mode);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldFallbackWhenSiteDoesNotSupportPreview(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            PreviewModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            sitecoreContextHelper.Context.Site.EnablePreview.ReturnsFalse();

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode());
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldFallbackWhenCouldNotSwitchToPreviewMode(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            PreviewModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            contextSite.EnablePreview.ReturnsTrue();
            sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Preview).ReturnsFalse();

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode());
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldReturnSameHorizonParamsWhenStateIsValid(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            PreviewModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            contextSite.EnablePreview.ReturnsTrue();
            sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Preview).ReturnsTrue();

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(parameters);
        }
    }
}
