// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.CollectIFrameAllowedDomains
{
    public class AddDomainsListTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldWorkWithDefaultCtor(
      CollectIFrameAllowedDomainsArgs args
      )
        {
            // arrange
            AddDomainsList sut = new();

            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().BeEmpty();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldWorkWithNullValue(
        CollectIFrameAllowedDomainsArgs args
        )
        {
            // arrange
            AddDomainsList sut = new()
            {
                AllowedDomains = null
            };

            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().BeEmpty();
        }

        [Theory]
        [InlineAutoNData("https://mockdomain")]
        internal void Process_ShouldNotAddExistingDomains(
            string allowedDomain,
             CollectIFrameAllowedDomainsArgs args
            )
        {
            // arrange
            AddDomainsList sut = new AddDomainsList();
            sut.AllowedDomains = allowedDomain;

            // act
            sut.Process(args);
            sut.Process(args);

            // assert
            args.AllowedDomains.Should().ContainSingle(allowedDomain);

        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldNotAddEmptyEntries(         
          CollectIFrameAllowedDomainsArgs args
         )
        {
            // arrange
            string allowedDomainsList = "https://mockdomain;  ;    ;;";
            AddDomainsList sut = new()
            {
                AllowedDomains = allowedDomainsList
            };
            // act
            sut.Process(args);

            // assert
            args.AllowedDomains.Count.Should().Be(1);
            args.AllowedDomains.Should().NotContain("  ");
            args.AllowedDomains.Should().NotContain("    ");

        }

        [Theory]
        [InlineAutoNData("")]
        [InlineAutoNData("https://mockdomain")]
        [InlineAutoNData("https://mockdomain;https://mockdomain2")]
        [InlineAutoNData("https://mockdomain;;;;;;https://mockdomain2")]
        internal void Process_ShouldAddMultipleDomainsToAllowedDomains(
         string allowedDomain,
         CollectIFrameAllowedDomainsArgs args
         )
        {
            // arrange
            AddDomainsList sut = new()
            {
                AllowedDomains = allowedDomain
            };

            // act
            sut.Process(args);

            // assert
            foreach (var domain in allowedDomain?.Split(new char[] { ';' }, System.StringSplitOptions.RemoveEmptyEntries))
            {
                args.AllowedDomains.Should().Contain(domain);
            }
        }
    }
}
