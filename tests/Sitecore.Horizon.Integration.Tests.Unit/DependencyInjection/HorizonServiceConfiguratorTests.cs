// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Horizon.Integration.DependencyInjection;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.DependencyInjection
{
    public class HorizonServiceConfiguratorTests
    {
        [Theory]
        [AutoNData]
        internal void Configure_ShouldNotThrow(HorizonServiceConfigurator sut, IServiceCollection serviceCollection)
        {
            // act
            // assert
            sut.Invoking(x => x.Configure(serviceCollection)).Should().NotThrow();
        }
    }
}
