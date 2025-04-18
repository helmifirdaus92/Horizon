// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class ResolveHorizonModeArgsTests
    {
        [Theory]
        [AutoNData]
        internal void SetResult_ShouldChangeResult(ResolveHorizonModeArgs sut, HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange

            // act
            sut.SetResult(parameters);

            // assert
            sut.Result.Should().BeSameAs(parameters);
        }

        [Theory]
        [AutoNData]
        internal void SetResultAndAbortPipeline_ShouldChangeResult(ResolveHorizonModeArgs sut, HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange

            // act
            sut.SetResultAndAbortPipeline(parameters);

            // assert
            sut.Result.Should().BeSameAs(parameters);
        }
    }
}
