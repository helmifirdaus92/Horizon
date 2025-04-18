// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using FluentAssertions;
using Sitecore.Horizon.Integration.GraphQL.Controllers;
using Sitecore.Horizon.Integration.GraphQL.DependencyInjection;
using Sitecore.Horizon.Integration.GraphQL.Performance;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit
{
    public class InternalAccessModifierTests
    {
        [Fact]
        public void AssemblyShouldNotContainPublicTypes()
        {
            // arrange
            var assembly = typeof(HorizonIntegrationGqlConfigurator).Assembly;

            // act
            var allTypes = assembly
                .GetExportedTypes()
                .Except(new[]
                {
                    typeof(HorizonQueryController),
                    typeof(GqlQuery),
                    typeof(IGraphQLPerformance)
                });

            // assert
            allTypes.Should().BeEmpty();
        }
    }
}
