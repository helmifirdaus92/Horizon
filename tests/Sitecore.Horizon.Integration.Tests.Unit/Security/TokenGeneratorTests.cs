// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using FluentAssertions;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Security
{
    public class TokenGeneratorTests
    {
        [Theory]
        [InlineAutoNData(null)]
        [InlineAutoNData("")]
        internal void GenerateToken_ShouldThrowWhenInputIsNullOrEmpty(
            string input,
            TokenGenerator sut,
            byte[] secret)
        {
            // arrange

            // act
            // assert
            sut.Invoking(x => x.GenerateToken(input, secret)).Should().Throw<ArgumentException>();
        }

        [Theory, AutoNData]
        internal void GenerateToken_ShouldThrowWhenSecretIsNull(
            TokenGenerator sut,
            string input)
        {
            // arrange

            // act
            // assert
            sut.Invoking(x => x.GenerateToken(input, null)).Should().Throw<ArgumentException>();
        }

        [Theory, AutoNData]
        internal void GenerateToken_ShouldReturnNonEmptyToken(
            TokenGenerator sut,
            string input,
            byte[] secret)
        {
            // arrange

            // act
            var result = sut.GenerateToken(input, secret);

            // assert
            result.Should().NotBeNullOrEmpty();
        }
    }
}
