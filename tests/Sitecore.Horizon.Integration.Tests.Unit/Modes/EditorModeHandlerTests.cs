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
    public class EditorModeHandlerTests
    {
        [Theory]
        [AutoNData]
        internal void CanHandle_ShouldReturnTrueForEditorMode(EditorModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(HeadlessMode.Edit);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void CanHandle_ShouldReturnFalseForNonEditorModes(HeadlessMode mode, EditorModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(mode);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldFallbackWhenWebEditingIsDisabled(
            EditorModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            httpContext.Request.QueryString["sc_webedit"] = "0";
            var expectedFallbackForDisabledDisplayMode = new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
                ResetDisplayMode = true
            };

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(expectedFallbackForDisabledDisplayMode);
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldFallbackWhenSiteDoesNotSupportEditing(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            EditorModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            sitecoreContextHelper.Context.Site.EnableWebEdit.ReturnsFalse();

            var expectedFallbackForDisabledDisplayMode = new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
                ResetDisplayMode = true
            };

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(expectedFallbackForDisabledDisplayMode);
        }


        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldFallbackWhenCouldNotSwitchToEditMode(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            EditorModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            var expectedFallbackForDisabledDisplayMode = new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
                ResetDisplayMode = true
            };
            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            contextSite.EnablePreview.ReturnsTrue();
            sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Edit).ReturnsFalse();

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(expectedFallbackForDisabledDisplayMode);
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldReturnSameHorizonParamsWhenStateIsValid(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            EditorModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            contextSite.EnableWebEdit.ReturnsTrue();
            sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Edit).ReturnsTrue();

            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(parameters);
        }
    }
}
