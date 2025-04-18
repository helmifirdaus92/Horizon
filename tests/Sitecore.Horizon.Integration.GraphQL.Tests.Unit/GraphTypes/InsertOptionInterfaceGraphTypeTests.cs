// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class InsertOptionInterfaceGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveTypeToBranchTemplateGraphType([Frozen] IHorizonItemHelper itemHelper, InsertOptionInterfaceGraphType sut, TemplateItem templateItem)
        {
            // act & assert
            var resolvedType = sut.ResolveType(templateItem);
            resolvedType.GetType().Should().Be(typeof(BranchTemplateGraphType));
        }

        [Theory, AutoNData]
        internal void ShouldResolveTypeToItemTemplateGraphType([Frozen] IHorizonItemHelper itemHelper, InsertOptionInterfaceGraphType sut, TemplateItem templateItem)
        {
            //arrange
            itemHelper.GetBranchTemplateId(templateItem).ReturnsNull();

            // act & assert
            var resolvedType = sut.ResolveType(templateItem);
            resolvedType.GetType().Should().Be(typeof(ItemTemplateGraphType));
        }
    }
}
