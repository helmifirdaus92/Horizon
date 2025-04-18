// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class EnableHorizonModeTests
    {
        [Theory]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void ShouldEnableHorizonModePersistently(HeadlessMode mode, EnableHorizonMode sut, ResolveHorizonModeArgs args)
        {
            // arrange
            args.RequestState = new HeadlessRequestState(mode);

            args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Disabled)));

            // act
            sut.Process(ref args);

            // assert
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost = new(HeadlessModeParametersBuilder.Persistent(mode), args.HorizonRequestState.HorizonHost);

            args.Result.Should().BeEquivalentTo(headlessModeParametersWithHorizonHost);
        }
    }
}
