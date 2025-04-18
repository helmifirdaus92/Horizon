// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.CollectIFrameAllowedDomains
{
    public class AddHorizonClientHostTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldAddClientHostToAllowedDomains(
            [Frozen] BaseSettings settings,
            AddHorizonClientHost sut,
            CollectIFrameAllowedDomainsArgs args,
            string clientHostValue)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(clientHostValue);

            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().Contain(clientHostValue);
        }

        [Theory]
        [InlineAutoNData(null)]
        [InlineAutoNData("")]
        internal void Process_ShouldNotAddClientHostToAllowedDomainsWhenNullOrEmpty(
            string clientHost,
            [Frozen] BaseSettings settings,
            AddHorizonClientHost sut,
            CollectIFrameAllowedDomainsArgs args,
            string clientHostValue)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(clientHost);

            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().NotContain(clientHostValue);
        }
    }
}
