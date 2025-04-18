// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using FluentAssertions;
using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.HttpRequest;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.HttpRequest;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HttpRequest
{
    public class InitializeHorizonTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldDelegateToInitializer(
            [Frozen] IHorizonInitializer horizonInitializer,
            InitializeHorizon sut,
            HttpContextBase httpContext)
        {
            // arrange
            var args = new HttpRequestArgs(httpContext);

            // act
            sut.Process(args);

            // assert
            horizonInitializer.Received().InitializeHorizonHeadless(httpContext);
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void Process_ShouldAbortPipelineInHorizonApiMode(
            HeadlessMode mode,
            [Frozen] IHorizonInternalContext horizonContext,
            InitializeHorizon sut,
            HttpContextBase httpContext)
        {
            // arrange
            var args = new HttpRequestArgs(httpContext);
            horizonContext.GetHeadlessMode().Returns(mode);

           // act
           sut.Process(args);

            // assert
            if (mode == HeadlessMode.Api)
            {
                args.Aborted.Should().BeTrue();
            }
            else
            {
               args.Aborted.Should().BeFalse();
            }
        }
    }
}
