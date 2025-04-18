// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;
using Sitecore.Extensions;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Pipelines.GetComponents;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ComponentGroupGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldMapProperties(ComponentGroupGraphType sut, string name, IList<Item> components)
        {
            // arrange
            var componentGroup = new ComponentGroup
            {
                Name = name
            };
            componentGroup.Components.AddRange(components);

            // act & assert
            sut.Should().ResolveFieldValueTo("title", componentGroup.Name, c => c.WithSource(componentGroup));
            sut.Should().ResolveFieldValueTo("components", componentGroup.Components, c => c.WithSource(componentGroup));
        }
    }
}
