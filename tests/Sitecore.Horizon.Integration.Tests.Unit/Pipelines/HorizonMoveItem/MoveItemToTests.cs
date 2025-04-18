// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonMoveItem
{
    public class MoveItemToTests
    {
        [Theory]
        [InlineAutoNData(0, 100, 50)]
        [InlineAutoNData(50, 100, 75)]
        [InlineAutoNData(100, 200, 150)]
        internal void Process_MoveAfterShouldPlaceItemBetweenTargetAndTargetNextSibling(
            int nextSiblingSortOrder,
            int targetItemSortOrder,
            int expectedSortOrder,
            MoveItemTo sut,
            Item targetParentItem,
            Item itemToMove,
            Item targetItem,
            Item nextSibling
        )
        {
            // arrange
            nextSibling.AsFake().WithAppearance().WithItemAxes();
            nextSibling.Appearance.Sortorder.Returns(nextSiblingSortOrder);

            targetItem.AsFake().WithAppearance().WithItemAxes().WithItemEditing()
                .WithParent(targetParentItem.AsFake().WithItemEditing());
            targetItem.Appearance.Sortorder.Returns(targetItemSortOrder);
            targetItem.Axes.GetNextSibling().Returns(nextSibling);

            itemToMove.AsFake().WithItemAxes().WithItemEditing().WithAppearance();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.After);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetParentItem);
            args.ItemToMove.Appearance.Sortorder.Should().Be(expectedSortOrder);
        }

        [Theory]
        [InlineAutoNData(0, 100)]
        [InlineAutoNData(100, 200)]
        [InlineAutoNData(200, 300)]
        internal void Process_MoveAfterShouldPlaceItemAfterTargetItemIfNoNextSibling(
            int targetItemSortOrder,
            int expectedSortOrder,
            MoveItemTo sut,
            Item targetParentItem,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithAppearance().WithItemAxes().WithItemEditing()
                .WithParent(targetParentItem.AsFake().WithItemEditing());
            targetItem.Appearance.Sortorder.Returns(targetItemSortOrder);

            itemToMove.AsFake().WithItemAxes().WithItemEditing().WithAppearance();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.After);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetParentItem);
            args.ItemToMove.Appearance.Sortorder.Should().Be(expectedSortOrder);
        }

        [Theory]
        [InlineAutoNData(1, 0, 50, 0)]
        [InlineAutoNData(51, 50, 50, 0)]
        [InlineAutoNData(101, 100, 50, 0)]
        internal void Process_MoveAfterShouldReSortSiblingsIfNoSpaceBetweenTargetAndTargetNextSibling(
            int nextSiblingSortOrder,
            int targetItemSortOrder,
            int expectedSortOrder,
            int targetItemExpectedSortOrder,
            MoveItemTo sut,
            Item targetParentItem,
            Item itemToMove,
            Item targetItem,
            Item nextSibling
        )
        {
            // arrange
            nextSibling.AsFake().WithAppearance().WithItemAxes();
            nextSibling.Appearance.Sortorder.Returns(nextSiblingSortOrder);

            targetItem.AsFake().WithAppearance().WithItemAxes().WithItemEditing()
                .WithParent(targetParentItem.AsFake().WithItemEditing());
            targetItem.Appearance.Sortorder.Returns(targetItemSortOrder);
            targetItem.Axes.GetNextSibling().Returns(nextSibling);

            itemToMove.AsFake().WithItemAxes().WithItemEditing().WithAppearance();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.After);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetParentItem);
            args.ItemToMove.Appearance.Sortorder.Should().Be(expectedSortOrder);
            args.TargetItem.Appearance.Sortorder.Should().Be(targetItemExpectedSortOrder);
        }

        [Theory]
        [InlineAutoNData(0, 100, 50)]
        [InlineAutoNData(50, 100, 75)]
        [InlineAutoNData(100, 200, 150)]
        internal void Process_MoveBeforeShouldPlaceItemBetweenTargetAndTargetPreviousSibling(
            int previousSiblingSortOrder,
            int targetItemSortOrder,
            int expectedSortOrder,
            MoveItemTo sut,
            Item targetParentItem,
            Item itemToMove,
            Item targetItem,
            Item previousSibling
        )
        {
            // arrange
            previousSibling.AsFake().WithAppearance().WithItemAxes();
            previousSibling.Appearance.Sortorder.Returns(previousSiblingSortOrder);

            targetItem.AsFake().WithAppearance().WithItemAxes().WithItemEditing()
                .WithParent(targetParentItem.AsFake().WithItemEditing());
            targetItem.Appearance.Sortorder.Returns(targetItemSortOrder);
            targetItem.Axes.GetPreviousSibling().Returns(previousSibling);

            itemToMove.AsFake().WithItemAxes().WithItemEditing().WithAppearance();
            itemToMove.Appearance.Sortorder.Returns(100);

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Before);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetParentItem);
            args.ItemToMove.Appearance.Sortorder.Should().Be(expectedSortOrder);
        }

        [Theory]
        [InlineAutoNData(0, -100)]
        [InlineAutoNData(100, 0)]
        [InlineAutoNData(200, 100)]
        internal void Process_MoveBeforeShouldPlaceItemBeforeTargetItemIfNoPreviousSibling(
            int targetItemSortOrder,
            int expectedSortOrder,
            MoveItemTo sut,
            Item targetParentItem,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithAppearance().WithItemAxes().WithItemEditing()
                .WithParent(targetParentItem.AsFake().WithItemEditing());
            targetItem.Appearance.Sortorder.Returns(targetItemSortOrder);

            itemToMove.AsFake().WithItemAxes().WithItemEditing().WithAppearance();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Before);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetParentItem);
            args.ItemToMove.Appearance.Sortorder.Should().Be(expectedSortOrder);
        }

        [Theory, AutoNData]
        internal void Process_MoveIntoShouldMoveItemToTargetItem(
            MoveItemTo sut,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Into);

            // act
            sut.Process(ref args);

            // assert
            args.ItemToMove.Received().MoveTo(targetItem);
        }
    }
}
