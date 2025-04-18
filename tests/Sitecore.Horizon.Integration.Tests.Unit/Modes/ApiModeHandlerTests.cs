// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
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
    public class ApiModeHandlerTests
    {
        [Theory]
        [AutoNData]
        internal void CanHandle_ShouldReturnTrueForApiMode(ApiModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(HeadlessMode.Api);

            // assert
            result.Should().BeTrue();
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void CanHandle_ShouldReturnFalseForNonApiModes(HeadlessMode mode, ApiModeHandler sut)
        {
            // arrange

            // act
            bool result = sut.CanHandle(mode);

            // assert
            result.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void HandleHorizonMode_ShouldReturnForRequestApiModeParametersWithDisabledBeaconWhenStateIsValid(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            ApiModeHandler sut,
            HeadlessModeParameters parameters,
            HttpContextBase httpContext)
        {
            // arrange
            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            contextSite.EnableWebEdit.ReturnsTrue();
            sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Edit).ReturnsTrue();

            HeadlessModeParameters expectedParameters = new HeadlessModeParameters()
            {
                Mode = HeadlessMode.Api,
                Duration = HeadlessModeDuration.CurrentRequest,
            };
          
            // act
            HeadlessModeParameters result = sut.HandleHeadlessMode(parameters, httpContext);

            // assert
            result.Should().BeEquivalentTo(expectedParameters);
        }
    }
}
