// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using FluentAssertions;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.CollectIFrameAllowedDomains
{
    public class AddDomainsTests
    {
        [Theory]
        [InlineAutoNData(null)]
        [InlineAutoNData("")]
        internal void AddDomain_ShouldFailForNullOrEmptyValue(string allowedDomain, AddDomains sut)
        {
            // act
            // assert
            sut.Invoking(x => x.AddDomain(allowedDomain)).Should().Throw<ArgumentException>();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldAddRegisteredDomainsToAllowedDomains(
            AddDomains sut,
            CollectIFrameAllowedDomainsArgs args,
            string allowedDomain)
        {
            // arrange
            sut.AddDomain(allowedDomain);

            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().Contain(allowedDomain);
        }
    }
}
