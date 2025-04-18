// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Modes;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security.Accounts;
using Sitecore.Sites;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Context
{
    public class HorizonInitializerTests
    {
        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldDisableHorizonModeForRequestWhenHttpContextIsNull(
            [Frozen] IHorizonInternalContext horizonContext,
            HorizonInitializer sut)
        {
            // arrange
            HeadlessModeParametersWithHorizonHost received = null;
            horizonContext.SetHeadlessMode(Any.ArgDo((HeadlessModeParametersWithHorizonHost x) => received = x));

            var expectedHeadlessModeParameters = new HeadlessModeParametersWithHorizonHost(new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
            });

            // act
            sut.InitializeHorizonHeadless(null);

            // assert
            received.Should().BeEquivalentTo(expectedHeadlessModeParameters);
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldDisableHorizonModeForRequestWhenSiteIsNull(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            HorizonInitializer sut,
            HttpContextBase httpContext)
        {
            // arrange
            HeadlessModeParametersWithHorizonHost received = null;
            horizonContext.SetHeadlessMode(Any.ArgDo<HeadlessModeParametersWithHorizonHost>(x => received = x));
            var expectedHeadlessModeParameters = new HeadlessModeParameters
            {
                Mode = HeadlessMode.Disabled,
                Duration = HeadlessModeDuration.CurrentRequest,
            };
            sitecoreContextHelper.Context.Configure().Site.ReturnsNull();

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            received.Should().BeEquivalentTo(new HeadlessModeParametersWithHorizonHost(expectedHeadlessModeParameters));
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldCallResolveHorizonModePipeline(
            [Frozen] IHorizonPipelines horizonPipelines,
            HorizonInitializer sut,
            HttpContextBase httpContext)
        {
            // arrange

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            horizonPipelines.Received().ResolveHorizonMode(ref Arg.Any<ResolveHorizonModeArgs>());
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldPassHorizonModeParamsToContext(
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost)
        {
            // arrange
            headlessModeParametersWithHorizonHost.Parameters.Mode = HeadlessMode.Api;
            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(headlessModeParametersWithHorizonHost)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            horizonContext.Received().SetHeadlessMode(Any.Arg<HeadlessModeParametersWithHorizonHost>());
        }

        [Theory]
        [InlineAutoNData(true)]
        [InlineAutoNData(false)]
        internal void InitializeHorizon_ShouldResetDisplayModeForRequestWhenPipelineAsk(
            bool resetDisplayMode,
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonPipelines horizonPipelines,
            HorizonInitializer sut,
            HttpContextBase httpContext)
        {
            // arrange
            HeadlessModeParametersWithHorizonHost expectedHeadlessModeParameters = new(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled))
            {
                Parameters =
                {
                    ResetDisplayMode = resetDisplayMode
                }
            };

            SiteContext contextSite = sitecoreContextHelper.Context.Site;

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(expectedHeadlessModeParameters)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            sitecoreContextHelper.Received(resetDisplayMode ? 1 : 0).ResetDisplayModeForRequest(contextSite);
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldRedirectToLoginPageWhenUserDoesNotHaveHorizonAccess(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] IHorizonRequestHelper requestHelper,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange
            parameters.Parameters.Mode = HeadlessMode.Edit;

            User contextUser = sitecoreContextHelper.Context.User;

            horizonContext.HasHorizonAccess(contextUser).ReturnsFalse();

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(parameters)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            horizonContext.Received(1).HasHorizonAccess(contextUser);
            requestHelper.Received(1).RedirectToLoginPageIfApplicable(httpContext);
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldNotRedirectToLoginPageIfModeIsApi(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] IHorizonRequestHelper requestHelper,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost)
        {
            // arrange
            headlessModeParametersWithHorizonHost.Parameters.Mode = HeadlessMode.Api;

            User contextUser = sitecoreContextHelper.Context.User;

            horizonContext.HasHorizonAccess(contextUser).ReturnsFalse();

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(headlessModeParametersWithHorizonHost)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            horizonContext.Received(1).HasHorizonAccess(contextUser);
            requestHelper.DidNotReceive().RedirectToLoginPageIfApplicable(httpContext);
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void InitializeHorizon_ShouldTryResolveHandlerForNonDisabledHorizonMode(
            HeadlessMode mode,
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] IHorizonModeHandlerResolver modeHandlerResolver,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange
            parameters.Parameters.Mode = mode;

            User contextUser = sitecoreContextHelper.Context.User;

            horizonContext.HasHorizonAccess(contextUser).ReturnsTrue();

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(parameters)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            modeHandlerResolver.Received().ResolveHandler(mode);
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldDisableHorizonModePersistentlyWhenModeHandlerCouldNotBeResolved(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] IHorizonModeHandlerResolver modeHandlerResolver,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange
            parameters.Parameters.Mode = HeadlessMode.Edit;
            User contextUser = sitecoreContextHelper.Context.User;

            horizonContext.HasHorizonAccess(contextUser).ReturnsTrue();
            modeHandlerResolver.ResolveHandler(Any.Arg<HeadlessMode>()).ReturnsNull();

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(parameters)));

            HeadlessModeParametersWithHorizonHost receivedParameters = null;
            horizonContext.SetHeadlessMode(Arg.Do<HeadlessModeParametersWithHorizonHost>(x => receivedParameters = x));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost = new(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled));
            receivedParameters.Should().BeEquivalentTo(headlessModeParametersWithHorizonHost);
        }

        [Theory]
        [AutoNData]
        internal void InitializeHorizon_ShouldConsumeParamsFromModeHandlerWhenExists(
            [Frozen] ISitecoreContextHelper sitecoreContextHelper,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonPipelines horizonPipelines,
            [Frozen] IHorizonModeHandlerResolver modeHandlerResolver,
            HorizonInitializer sut,
            HttpContextBase httpContext,
            HeadlessModeParameters parameters,
            IHorizonModeHandler modeHandler,
            HeadlessModeParameters finalParameters,
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost)
        {
            // arrange
            parameters.Mode = HeadlessMode.Edit;
            headlessModeParametersWithHorizonHost.Parameters = parameters;
            User contextUser = sitecoreContextHelper.Context.User;

            horizonContext.HasHorizonAccess(contextUser).ReturnsTrue();

            modeHandler.HandleHeadlessMode(parameters, httpContext).Returns(finalParameters);
            modeHandlerResolver.ResolveHandler(Any.Arg<HeadlessMode>()).Returns(modeHandler);

            horizonPipelines.ResolveHorizonMode(ref Any.ArgDo((ref ResolveHorizonModeArgs x) => x.SetResult(headlessModeParametersWithHorizonHost)));

            // act
            sut.InitializeHorizonHeadless(httpContext);

            // assert
            horizonContext.Received().SetHeadlessMode(
                Arg.Is<HeadlessModeParametersWithHorizonHost>(
                    x => x.HorizonHost == headlessModeParametersWithHorizonHost.HorizonHost &&
                        x.Parameters == finalParameters));

        }
    }
}
