// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.ResolveHorizonMode
{
    public class EnsureHorizonHostIsAllowedTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldThrowIfRequestStateIsNull(ResolveHorizonModeArgs args, EnsureHorizonHostIsAllowed sut)
        {
            args.HorizonRequestState = null;

            sut.Invoking(x => x.Process(ref args)).Should().Throw<ArgumentNullException>();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldReturnHostFromSetting_WhenRequestHostIsEmpty(
            ResolveHorizonModeArgs args,
            string hostSetting,
            [Frozen] BaseSettings settings,
            EnsureHorizonHostIsAllowed sut)
        {
            // arrange
            settings.Horizon().ClientHost.Returns(hostSetting);
            args.HorizonRequestState = new HorizonRequestState(HorizonMode.Editor, string.Empty);

            // act
            sut.Process(ref args);

            // assert
            args.HorizonRequestState.HorizonHost.Should().Be(hostSetting);
        }

        [Theory]
        [InlineAutoNData("https://horizon.sitecore.cloud", new[] { "https://horizon.sitecore.cloud", "http://pages.sitecore.com", })]
        [InlineAutoNData("https://pages.sitecore.com:443", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com", })]
        [InlineAutoNData("http://localhost:5000", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com", "http://localhost:5000" })]
        [InlineAutoNData("https://localhost:5001", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com", "https://localhost:5001" })]
        [InlineAutoNData("https://pages.sitecore.com", new[] { "pages.sitecore.com", "https://horizon.sitecore.cloud" })]
        [InlineAutoNData("https://pages.sitecore.com", new[] { "https://horizon.sitecore.cloud", "pages.sitecore.com" })]
        internal void Process_ShouldKeepRequestHost_WhenHostMatchesAllowedDomains(
            string requestHost,
            string[] allowedDomains,
            ResolveHorizonModeArgs args,
            string hostSetting,
            [Frozen] BaseCorePipelineManager pipelineManager,
            [Frozen] BaseSettings settings
            )
        {
            // arrange
            pipelineManager.Horizon().CollectIFrameAllowedDomains(Arg.Do<CollectIFrameAllowedDomainsArgs>(x => allowedDomains.ToList().ForEach(d=>x.AllowedDomains.Add(d))));

            settings.Horizon().ClientHost.Returns(hostSetting);
            args.HorizonRequestState = new HorizonRequestState(HorizonMode.Editor, requestHost);

            var sut = new EnsureHorizonHostIsAllowed(settings, pipelineManager);
            // act
            sut.Process(ref args);

            // assert
            args.HorizonRequestState.HorizonHost.Should().Be(requestHost);
        }

        [Theory]
        [InlineAutoNData("https://horizon.beta.sitecore.cloud", new[] { "https://horizon.sitecore.cloud", "http://pages.sitecore.com", })]
        [InlineAutoNData("http://pages.sitecore.com", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com", })]
        [InlineAutoNData("https://pages.sitecore.com:7000", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com", })]
        [InlineAutoNData("http://localhost:5000", new[] { "https://horizon.sitecore.cloud", "https://pages.sitecore.com"})]
        [InlineAutoNData("https://not.pages.sitecore.com", new[] { "pages.sitecore.com", "https://horizon.sitecore.cloud" })]
        internal void Process_ShouldReturnHostFromSetting_WhenRequestHostDoesntMatchesAllowedDomains(
            string requestHost,
            string[] allowedDomains,
            ResolveHorizonModeArgs args,
            string hostSetting,
            [Frozen] BaseCorePipelineManager pipelineManager,
            [Frozen] BaseSettings settings
        )
        {
            // arrange
            pipelineManager.Horizon().CollectIFrameAllowedDomains(Arg.Do<CollectIFrameAllowedDomainsArgs>(x => allowedDomains.ToList().ForEach(d => x.AllowedDomains.Add(d))));

            settings.Horizon().ClientHost.Returns(hostSetting);
            args.HorizonRequestState = new HorizonRequestState(HorizonMode.Editor, requestHost);

            var sut = new EnsureHorizonHostIsAllowed(settings, pipelineManager);
            // act
            sut.Process(ref args);

            // assert
            args.HorizonRequestState.HorizonHost.Should().Be(hostSetting);
        }
    }
}
