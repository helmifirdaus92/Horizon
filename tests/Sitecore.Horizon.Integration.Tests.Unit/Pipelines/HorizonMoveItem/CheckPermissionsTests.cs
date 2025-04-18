// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonMoveItem
{
    public class CheckPermissionsTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldSetErrorAndAbortPipelineIfItemToMoveIsAncestorOfTargetItem(
            CheckPermissions sut,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithItemAxes().WithItemAccess();
            targetItem.Access.CanCreate().ReturnsTrue();

            itemToMove.AsFake().WithItemAxes().WithItemAccess().WithAppearance();
            itemToMove.Access.CanMoveTo(targetItem).ReturnsTrue();
            itemToMove.Appearance.ReadOnly.ReturnsFalse();

            itemToMove.Axes.IsAncestorOf(targetItem).ReturnsTrue();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Into);

            // act
            sut.Process(ref args);

            // assert
            args.Error.Should().Be(MoveItemErrorCode.ItemNotAllowedToMoveToTarget);
            args.Aborted.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void Process_ShouldSetErrorAndAbortPipelineIfTargetItemDoesNotHaveCreateAccess(
            CheckPermissions sut,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithItemAxes().WithItemAccess();
            itemToMove.AsFake().WithItemAxes().WithItemAccess().WithAppearance();
            itemToMove.Access.CanMoveTo(targetItem).ReturnsTrue();
            itemToMove.Appearance.ReadOnly.ReturnsFalse();
            itemToMove.Axes.IsAncestorOf(targetItem).ReturnsFalse();

            targetItem.Access.CanCreate().ReturnsFalse();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Into);

            // act
            sut.Process(ref args);

            // assert
            args.Error.Should().Be(MoveItemErrorCode.ItemNotAllowedToMoveToTarget);
            args.Aborted.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void Process_ShouldSetErrorAndAbortPipelineIfItemToMoveDoesNotHaveRightToMoveToTargetItem(
            CheckPermissions sut,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithItemAxes().WithItemAccess();
            targetItem.Access.CanCreate().ReturnsTrue();

            itemToMove.AsFake().WithItemAxes().WithItemAccess().WithAppearance();
            itemToMove.Appearance.ReadOnly.ReturnsFalse();
            itemToMove.Axes.IsAncestorOf(targetItem).ReturnsFalse();

            itemToMove.Access.CanMoveTo(targetItem).ReturnsFalse();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Into);

            // act
            sut.Process(ref args);

            // assert
            args.Error.Should().Be(MoveItemErrorCode.ItemNotAllowedToMoveToTarget);
            args.Aborted.Should().BeTrue();
        }

        [Theory, AutoNData]
        internal void Process_ShouldSetErrorAndAbortPipelineIfItemToMoveIsProtectedItem(
            CheckPermissions sut,
            Item itemToMove,
            Item targetItem
        )
        {
            // arrange
            targetItem.AsFake().WithItemAxes().WithItemAccess();
            targetItem.Access.CanCreate().ReturnsFalse();

            itemToMove.AsFake().WithItemAxes().WithItemAccess().WithAppearance();
            itemToMove.Axes.IsAncestorOf(targetItem).ReturnsFalse();
            itemToMove.Access.CanMoveTo(targetItem).ReturnsTrue();

            itemToMove.Appearance.ReadOnly.ReturnsTrue();

            var args = HorizonMoveItemArgs.Create(itemToMove, targetItem, MovePosition.Into);

            // act
            sut.Process(ref args);

            // assert
            args.Error.Should().Be(MoveItemErrorCode.ItemNotAllowedToMoveToTarget);
            args.Aborted.Should().BeTrue();
        }
    }
}
