// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ContentInterfaceGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveTypeToPageGraphType([Frozen] IHorizonItemHelper itemHelper, ContentInterfaceGraphType sut, Item item)
        {
            //arrange
            itemHelper.HasPresentation(item).Returns(true);

            // act & assert
            sut.ResolveType(item).GetType().Should().Be(typeof(PageGraphType));
        }

        [Theory, AutoNData]
        internal void ShouldResolveTypeToFolderGraphType([Frozen] IHorizonItemHelper itemHelper, ContentInterfaceGraphType sut, Item item)
        {
            //arrange
            itemHelper.HasPresentation(item).Returns(false);
            itemHelper.IsFolder(item).Returns(true);

            // act & assert
            sut.ResolveType(item).GetType().Should().Be(typeof(FolderGraphType));
        }

        [Theory, AutoNData]
        internal void ShouldResolveTypeToItemGraphType([Frozen] IHorizonItemHelper itemHelper, ContentInterfaceGraphType sut, Item item)
        {
            //arrange
            itemHelper.HasPresentation(item).Returns(false);
            itemHelper.IsFolder(item).Returns(false);

            // act & assert
            sut.ResolveType(item).GetType().Should().Be(typeof(ItemGraphType));
        }
    }
}
