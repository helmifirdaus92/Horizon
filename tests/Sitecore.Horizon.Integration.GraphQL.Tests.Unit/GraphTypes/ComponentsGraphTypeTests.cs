// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Pipelines.GetComponents;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ComponentsGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldMapProperties(ComponentsGraphType sut, IList<Item> components, IList<ComponentGroup> groups)
        {
            // arrange
            var componentsInfo = new ComponentsInfo(components, groups);

            // act & assert
            sut.Should().ResolveFieldValueTo("groups", componentsInfo.Groups, c => c.WithSource(componentsInfo));
            sut.Should().ResolveFieldValueTo("ungrouped", componentsInfo.Ungrouped, c => c.WithSource(componentsInfo));
        }
    }
}
