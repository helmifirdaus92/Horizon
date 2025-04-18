// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Modes;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Sites.Headless;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Modes
{
    public class HorizonModeHandlerResolverTests
    {
        [Theory]
        [AutoNData]
        internal void ResolveHandler_ShouldReturnNullWhenDoesNotHaveAnyHandler(HeadlessMode mode)
        {
            // arrange
            var sut = new HorizonModeHandlerResolver(Enumerable.Empty<IHorizonModeHandler>());

            // act
            var result = sut.ResolveHandler(mode);

            // assert
            result.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void ResolveHandler_ShouldReturnNullWhenRegisteredHandlerCouldNotHandleMode(
            IHorizonModeHandler handler,
            HeadlessMode mode)
        {
            // arrange
            handler.CanHandle(Any.Arg<HeadlessMode>()).ReturnsFalse();

            var sut = new HorizonModeHandlerResolver(new[]
            {
                handler
            });

            // act
            var result = sut.ResolveHandler(mode);

            // assert
            result.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void ResolveHandler_ShouldReturnHandlerWhenCanHandleMode(
            IHorizonModeHandler handler,
            HeadlessMode mode)
        {
            // arrange
            handler.CanHandle(mode).ReturnsTrue();

            var sut = new HorizonModeHandlerResolver(new[]
            {
                handler
            });

            // act
            var result = sut.ResolveHandler(mode);

            // assert
            result.Should().Be(handler);
        }

        [Theory]
        [AutoNData]
        internal void ResolveHandler_ShouldReturnFirstHandlerThatCanHandleMode(
            IHorizonModeHandler firstHandler,
            IHorizonModeHandler secondHandler,
            HeadlessMode mode)
        {
            // arrange
            firstHandler.CanHandle(mode).ReturnsTrue();
            secondHandler.CanHandle(mode).ReturnsTrue();

            var sut = new HorizonModeHandlerResolver(new[]
            {
                firstHandler,
                secondHandler
            });

            // act
            var result = sut.ResolveHandler(mode);

            // assert
            result.Should().Be(firstHandler);
        }
    }
}
