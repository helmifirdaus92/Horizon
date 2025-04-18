// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Security;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Security
{
    public class HostVerificationTokenHelperTests
    {
        [Theory, AutoNData]
        internal void GenerateToken_ShouldReturnTokenWithGeneratedSecretWhenClientHostSecretIsEmpty(
            [Frozen] ITokenGenerator tokenGenerator,
            [Frozen] ISitecoreContext context,
            BaseSettings settings,
            [Frozen] IRandomSecretGenerator randomSecretGenerator,
            BaseLog logger,
            string userIdentifier)
        {
            // arrange
            settings.Horizon().ClientHostSecret.Returns(string.Empty);

            byte[] validSecret = System.Convert.FromBase64String("5K9FqVhL3hvAUmy80pPbj7eKUMhorHJGhhwRSsG0QaBzjuvHqrZPLw15LFCaTNIXoGPBOMArkacWWFcwpK7/Pw==");
            randomSecretGenerator.GenerateSecret().Returns(validSecret);

            var sut = new HostVerificationTokenHelper(context, settings, tokenGenerator, logger, randomSecretGenerator);
            context.User.GetProviderUserKey().ToString().Returns(userIdentifier);

            // act
            string result = sut.BuildHostVerificationToken();

            // assert
            result.Should().NotBeNullOrEmpty();
            randomSecretGenerator.Received().GenerateSecret();
            tokenGenerator.Received().GenerateToken(userIdentifier, validSecret);
        }

        [Theory, AutoNData]
        internal void GenerateToken_ShouldReturnTokenWithGeneratedSecretWhenClientHostSecretHasInvalidBase64String(
            [Frozen] ITokenGenerator tokenGenerator,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [Frozen] IRandomSecretGenerator randomSecretGenerator,
            BaseLog logger,
            string userIdentifier)
        {
            // arrange
            settings.Horizon().ClientHostSecret.Returns("invalid secret");

            byte[] validSecret = System.Convert.FromBase64String("5K9FqVhL3hvAUmy80pPbj7eKUMhorHJGhhwRSsG0QaBzjuvHqrZPLw15LFCaTNIXoGPBOMArkacWWFcwpK7/Pw==");
            randomSecretGenerator.GenerateSecret().Returns(validSecret);

            var sut = new HostVerificationTokenHelper(context, settings, tokenGenerator, logger, randomSecretGenerator);
            context.User.GetProviderUserKey().ToString().Returns(userIdentifier);

            // act
            string result = sut.BuildHostVerificationToken();

            // assert
            result.Should().NotBeNullOrEmpty();
            logger.Received().Warn(Any.String, Arg.Any<Exception>(), Any.Object);
            randomSecretGenerator.Received().GenerateSecret();
            tokenGenerator.Received().GenerateToken(userIdentifier, validSecret);
        }

        [Theory, AutoNData]
        internal void GenerateToken_ShouldLogWarningAndReturnTokenWithGeneratedSecretWhenClientHostSecretHasInvalidLength(
            [Frozen] ITokenGenerator tokenGenerator,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [Frozen] IRandomSecretGenerator randomSecretGenerator,
            BaseLog logger,
            string userIdentifier)
        {
            // arrange
            settings.Horizon().ClientHostSecret.Returns("2rOG5mHzbVT4ZxLPf3OEYA6FBGyGHoe5ojaU3WrCYwo=");

            byte[] validSecret = System.Convert.FromBase64String("5K9FqVhL3hvAUmy80pPbj7eKUMhorHJGhhwRSsG0QaBzjuvHqrZPLw15LFCaTNIXoGPBOMArkacWWFcwpK7/Pw==");
            randomSecretGenerator.GenerateSecret().Returns(validSecret);

            var sut = new HostVerificationTokenHelper(context, settings, tokenGenerator, logger, randomSecretGenerator);
            context.User.GetProviderUserKey().ToString().Returns(userIdentifier);

            // act
            string result = sut.BuildHostVerificationToken();

            // assert
            result.Should().NotBeNullOrEmpty();
            logger.Received().Warn(Any.String, Any.Object);
            randomSecretGenerator.Received().GenerateSecret();
            tokenGenerator.Received().GenerateToken(userIdentifier, validSecret);
        }


        [Theory, AutoNData]
        internal void GenerateToken_ShouldReturnTokenBasedOnClientHostSecretConfigurationIfSecretValid(
            [Frozen] ITokenGenerator tokenGenerator,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseSettings settings,
            [Frozen] IRandomSecretGenerator randomSecretGenerator,
            BaseLog logger,
            string userIdentifier)
        {
            // arrange
            settings.Horizon().ClientHostSecret.Returns("5K9FqVhL3hvAUmy80pPbj7eKUMhorHJGhhwRSsG0QaBzjuvHqrZPLw15LFCaTNIXoGPBOMArkacWWFcwpK7/Pw==");

            var sut = new HostVerificationTokenHelper(context, settings, tokenGenerator, logger, randomSecretGenerator);
            context.User.GetProviderUserKey().ToString().Returns(userIdentifier);

            // act
            string result = sut.BuildHostVerificationToken();

            // assert
            result.Should().NotBeNullOrEmpty();
            randomSecretGenerator.DidNotReceive().GenerateSecret();
        }
    }
}
