// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Media;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class MediaQueryResultGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(MediaQueryResultGraphType sut, MediaQueryResult mediaQueryResult)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("items", mediaQueryResult.Items, c => c.WithSource(mediaQueryResult));
            sut.Should().ResolveFieldValueTo("hasMoreItems", mediaQueryResult.HasMoreItems, c => c.WithSource(mediaQueryResult));
        }
    }
}
