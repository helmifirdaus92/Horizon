// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Web
{
    public class HorizonRequestStateTests
    {
        [Theory]
        [InlineAutoNData(null)]
        [InlineAutoNData("")]
        internal void Parse_ShouldReturnEmptyWhenValueIsNullOrEmpty(string value)
        {
            // arrange

            // act
            var result = HorizonRequestState.Parse(value, "");

            // assert
            result.Mode.Should().Be(HorizonMode.Disabled);
        }

        [Theory]
        [InlineAutoNData("api", HorizonMode.Api)]
        [InlineAutoNData("editor", HorizonMode.Editor)]
        [InlineAutoNData("preview", HorizonMode.Preview)]
        [InlineAutoNData("0", HorizonMode.Disabled)]
        [InlineAutoNData("_", HorizonMode.Disabled)]
        internal void Parse_ShouldReturnCorrectModeWhenValueContainsOnlyModeName(string value, HorizonMode mode)
        {
            // arrange

            // act
            var result = HorizonRequestState.Parse(value, "");

            // assert
            result.Mode.Should().Be(mode);
        }

        [Theory]
        [InlineAutoNData("editor|20180902T182500Z|1")]
        internal void Parse_ShouldReturnOnlyEmptyWhenPipedValueContainsIncorrectAmountOfEntries(string value)
        {
            // arrange

            // act
            var result = HorizonRequestState.Parse(value, "");

            // assert
            result.Mode.Should().Be(HorizonMode.Disabled);
        }

        [Theory]
        [InlineAutoNData("api", "staging")]
        internal void Parse_ShouldSaveAppEnvrionment(string value, string env)
        {
            // arrange

            // act
            var result = HorizonRequestState.Parse(value, env);

            // assert
            result.HorizonHost.Should().Be(env);
        }

        [Fact]
        internal void ToString_ShouldReturnEmptyWhenDisabledState()
        {
            // arrange
            var state = new HorizonRequestState(HorizonMode.Disabled, "");


            // act
            var result = state.RawMode();

            // assert
            result.Should().BeEmpty();
        }

        [Theory]
        [InlineAutoNData(HorizonMode.Api)]
        [InlineAutoNData(HorizonMode.Editor)]
        [InlineAutoNData(HorizonMode.Preview)]
        internal void ToString_ShouldNotContainPipeWhenDisplayDateIsNull(HorizonMode mode)
        {
            // arrange
            var state = new HorizonRequestState(mode, "");

            // act
            var result = state.RawMode();

            // assert
            result.Should().Be(mode.ToString().ToLowerInvariant());
        }
    }
}
