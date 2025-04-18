// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using FluentAssertions;
using GraphQL.Types;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Horizon.Integration.GraphQL.DependencyInjection;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Mvc.Extensions;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.DependencyInjection
{
    public class HorizonIntegrationGqlConfiguratorTests
    {
        [Theory, AutoNData]
        internal void ShouldRegisterAllGraphTypes(HorizonIntegrationGqlConfigurator sut)
        {
            // arrange
            var assembly = typeof(HorizonSchema).Assembly;
            var allGraphTypes = assembly.GetTypes().Where(t => t.IsAssignableTo(typeof(IGraphType))).Where(x => !x.IsAbstract);
            var serviceCollection = new ServiceCollection();

            // act
            sut.Configure(serviceCollection);

            // assert
            var registeredTypes = serviceCollection.Select(x => x.ServiceType);
            registeredTypes.Should().Contain(allGraphTypes);
        }
    }
}
