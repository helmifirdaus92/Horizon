// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class RenderingDefinitionGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(RenderingDefinitionGraphType sut, RenderingDefinitionInfo renderingDefinitionInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("datasourceRootItems", renderingDefinitionInfo.DatasourceRootItems, c => c.WithSource(renderingDefinitionInfo));
            sut.Should().ResolveFieldValueTo("templates", renderingDefinitionInfo.Templates, c => c.WithSource(renderingDefinitionInfo));
        }
    }
}
