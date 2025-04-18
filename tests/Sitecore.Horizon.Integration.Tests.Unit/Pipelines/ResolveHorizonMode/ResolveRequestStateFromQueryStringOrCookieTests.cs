// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class ResolveRequestStateFromQueryStringOrCookieTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldNoOverrideExistingState(
            ResolveRequestStateFromQueryStringOrCookie sut,
            ResolveHorizonModeArgs args,
            HeadlessRequestState state)
        {
            // arrange
            args.RequestState = state;

            // act
            sut.Process(ref args);

            // assert
            args.RequestState.Should().BeSameAs(state);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSetStateFromRequestHelperIfNotExist(
            [Frozen] ISitecoreContext sitecoreContext,
            IHeadlessContextWrapper headlessContext,
            ResolveRequestStateFromQueryStringOrCookie sut,
            ResolveHorizonModeArgs args,
            HeadlessRequestState state)
        {
            // arrange
            args.RequestState = null;
            sitecoreContext.Configure().HeadlessContext.Returns(headlessContext);
            sitecoreContext.HeadlessContext.GetStateFromQueryStringOrCookie().Returns(state);

            // act
            sut.Process(ref args);

            // assert
            args.RequestState.Should().BeSameAs(state);
        }
    }
}
