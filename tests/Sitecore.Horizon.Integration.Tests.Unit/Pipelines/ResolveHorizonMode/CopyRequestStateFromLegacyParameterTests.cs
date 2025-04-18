// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class CopyRequestStateFromLegacyParameterTests
    {
        [Theory]
        [InlineAutoNData(HorizonMode.Api, HeadlessMode.Api)]
        [InlineAutoNData(HorizonMode.Editor, HeadlessMode.Edit)]
        [InlineAutoNData(HorizonMode.Preview, HeadlessMode.Preview)]
        internal void ShouldEnableHorizonModeFromLegacyParameterWhenRegularIsDisabled(HorizonMode mode, HeadlessMode expectedHeadlessMode, CopyRequestStateFromLegacyParameter sut, ResolveHorizonModeArgs args)
        {
            // arrange
            args.RequestState = new HeadlessRequestState(HeadlessMode.Disabled);
            args.HorizonRequestState = new HorizonRequestState(mode, "");

            args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Disabled)));

            // act
            sut.Process(ref args);

            // assert
            args.RequestState.Mode.Should().Be(expectedHeadlessMode);
        }

        [Theory]
        [InlineAutoNData(HorizonMode.Preview, HeadlessMode.Edit)]
        internal void ShouldNotEnableHorizonModeFromLegacyParameterWhenRegularIsParsed(HorizonMode mode, HeadlessMode currentHeadlessMode, CopyRequestStateFromLegacyParameter sut, ResolveHorizonModeArgs args)
        {
            // arrange
            args.RequestState = new HeadlessRequestState(currentHeadlessMode);
            args.HorizonRequestState = new HorizonRequestState(mode, "");

            args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Disabled)));

            // act
            sut.Process(ref args);

            // assert
            args.RequestState.Mode.Should().Be(currentHeadlessMode);
        }
    }
}
