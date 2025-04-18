// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Web;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Security.Accounts;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Context
{
    public class HorizonContextTests
    {
        [Theory]
        [AutoNData]
        internal void GetMode_ShouldReturnDisabledModeByDefault(
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonContext sut)
        {
            // arrange
            WithDisabledCache(sitecoreContext);

            // act
            HorizonMode mode = sut.GetMode();

            // assert
            mode.Should().Be(HorizonMode.Disabled);
        }

        [Theory]
        [AutoNData]
        internal void GetHeadlessMode_ShouldReturnDisabledModeByDefault(
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonContext sut)
        {
            // arrange
            WithDisabledCache(sitecoreContext);

            // act
            HeadlessMode mode = sut.GetHeadlessMode();

            // assert
            mode.Should().Be(HeadlessMode.Disabled);
        }

        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void GetMode_ShouldReturnValueFromCache(
            HeadlessMode mode,
            [Frozen] IHeadlessContextWrapper headlessContext,
            [Frozen] ISitecoreContext sitecoreContext,
            HorizonContext sut,
            HeadlessModeParameters parameters)
        {
            // arrange
            WithEnabledCache(sitecoreContext);

            parameters.Mode = mode;
            sitecoreContext.SetData(HorizonContext.ContextModeKey, parameters);
            headlessContext.GetMode().Returns(mode);
            sitecoreContext.Configure().HeadlessContext.Returns(headlessContext);

            // act
            HeadlessMode result = sut.GetHeadlessMode();

            // assert
            sitecoreContext.HeadlessContext.Received().GetMode();
            result.Should().Be(mode);
        }

        [Theory]
        [AutoNData]
        internal void SetHorizonMode_ShouldWriteHorizonModeValueToCache(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHeadlessContextWrapper headlessContext,
            HorizonContext sut,
            HeadlessModeParametersWithHorizonHost parameters)
        {
            // arrange
            sitecoreContext.Configure().HeadlessContext.Returns(headlessContext);

            // act
            sut.SetHeadlessMode(parameters);

            // assert
            sitecoreContext.HeadlessContext.Received().SetMode(parameters.Parameters);
        }


        [Theory]
        [InlineAutoNData(HeadlessMode.Api, HorizonMode.Api)]
        [InlineAutoNData(HeadlessMode.Edit, HorizonMode.Editor)]
        [InlineAutoNData(HeadlessMode.Preview, HorizonMode.Preview)]
        [InlineAutoNData(HeadlessMode.Disabled, HorizonMode.Disabled)]
        internal void SetHorizonMode_ShouldSetCookieValue(
            HeadlessMode headlessMode,
            HorizonMode horizonMode,
            [Frozen] IHorizonRequestHelper requestHelper,
            HorizonContext sut,
            HeadlessModeParametersWithHorizonHost headlessModeParametersWithHorizonHost)
        {
            // arrange
            headlessModeParametersWithHorizonHost.Parameters.Mode = headlessMode;
            headlessModeParametersWithHorizonHost.Parameters.Duration = HeadlessModeDuration.Persistent;

            // act
            sut.SetHeadlessMode(headlessModeParametersWithHorizonHost);

            // assert
            requestHelper
                .Received()
                .SetHorizonModeCookie(
                    Any.Arg<HttpContextBase>(),
                    Arg.Is<HorizonRequestState>(x => x.Mode == horizonMode));
        }

        [Theory]
        [InlineAutoNData(true, true, true)]
        [InlineAutoNData(false, true, false)]
        [InlineAutoNData(true, false, false)]
        [InlineAutoNData(false, false, false)]
        internal void HasHorizonAccess_ShouldReturnBasedOnTicketManagerAndSiteManager(
            bool isValidTicket,
            bool canEnter,
            bool expectedResult,
            [Frozen] BaseTicketManager ticketManager,
            [Frozen] BaseSiteManager siteManager,
            HorizonContext sut,
            User contextUser)
        {
            // arrange
            ticketManager.IsCurrentTicketValid().Returns(isValidTicket);
            siteManager.CanEnter(Any.String, contextUser).Returns(canEnter);

            // act
            bool result = sut.HasHorizonAccess(contextUser);

            // assert
            result.Should().Be(expectedResult);
        }

        [Theory]
        [InlineAutoNData(HorizonMode.Editor, HorizonContextMode.Editor)]
        [InlineAutoNData(HorizonMode.Preview, HorizonContextMode.Preview)]
        [InlineAutoNData(HorizonMode.Api, HorizonContextMode.Api)]
        [InlineAutoNData(HorizonMode.Disabled, HorizonContextMode.None)]
        internal void HorizonMode_ShouldMapResultCorrectly(HorizonMode mode, HorizonContextMode expectedResult,
            [Frozen] ISitecoreContext scContext,
            HorizonContext sut)
        {
            // arrange
            scContext.GetData(HorizonContext.ContextModeKey).Returns(new HorizonModeParameters
            {
                Mode = mode
            });

            // act
            var result = ((IHorizonContext)sut).HorizonMode;

            // assert
            result.Should().Be(expectedResult);
        }

        private static void WithDisabledCache(ISitecoreContext sitecoreContext)
        {
            sitecoreContext.GetData(Any.String).Returns(null);
        }

        private static void WithEnabledCache(ISitecoreContext sitecoreContext)
        {
            var items = new Dictionary<string, object>();

            sitecoreContext.GetData(Any.String).Returns(call =>
            {
                items.TryGetValue(call.Arg<string>(), out object result);
                return result;
            });
            sitecoreContext
                .When(x => x.SetData(Any.String, Any.Object))
                .Do(call => items[call.Arg<string>()] = call.Arg<object>());
        }
    }
}
