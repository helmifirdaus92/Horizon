// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using FluentAssertions;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.DependencyInjection;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit
{
    public class InternalAccessModifierTests
    {
        [Fact]
        public void AssemblyShouldNotContainPublicTypes()
        {
            // arrange
            var assembly = typeof(HorizonServiceConfigurator).Assembly;
            var exceptions = new[]
            {
                // Provide public API to read context
                typeof(IHorizonContext),
                typeof(HorizonContextMode)
            };

            // act
            var publicTypes = assembly.GetExportedTypes().Except(exceptions);

            // assert
            publicTypes.Should().BeEmpty();
        }
    }
}
