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
    public class CheckRequestedModeTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldDisableHorizonWhenRequestStateHasDisabledMode(
            CheckRequestedMode sut,
            ResolveHorizonModeArgs args)
        {
            // arrange
            args.RequestState = new HeadlessRequestState(HeadlessMode.Disabled);

            // act
            sut.Process(ref args);

            // assert
            args.Result.Should().BeEquivalentTo(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void Process_ShouldAllowWhenRequestStateHasActiveMode(
            HeadlessMode mode,
            CheckRequestedMode sut,
            ResolveHorizonModeArgs args,
            HeadlessModeParametersWithHorizonHost result)
        {
            // arrange
            result.Parameters.Mode = mode;

            args.SetResult(result);

            args.RequestState = new HeadlessRequestState(mode);

            // act
            sut.Process(ref args);

            // assert
            args.Result.Should().BeEquivalentTo(result);
        }
    }
}
