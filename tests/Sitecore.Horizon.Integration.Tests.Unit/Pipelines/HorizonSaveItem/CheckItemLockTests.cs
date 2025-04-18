// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Data.Locking;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Pipelines.Save;
using Xunit;
using CheckItemLock = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.CheckItemLock;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckItemLockTests
    {
        [Theory]
        [InlineAutoNData(new[]
        {
            true,
            true,
            true
        })]
        [InlineAutoNData(new[]
        {
            true,
            true,
            false
        })]
        [InlineAutoNData(new[]
        {
            false,
            false,
            false
        })]
        internal void Process_ShouldReturnCorrectResultForLockedItems(
            bool[] itemsLockingByCurrentUser,
            [Frozen] ISitecoreContext context,
            CheckItemLock sut)
        {
            // arrange
            context.User.IsAdministrator.ReturnsFalse();

            Item[] items = itemsLockingByCurrentUser.Select(p => MockLockedItem(true, p)).ToArray();
            foreach (Item item in items)
            {
                context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);
            }

            var args = HorizonSaveItemArgs.Create();
            args.Items = items
                .Select(i => new HorizonArgsSaveItem()
                {
                    ID = i.ID
                })
                .ToArray();

            //act
            sut.Process(ref args);

            // assert
            if (itemsLockingByCurrentUser.All(i => i))
            {
                args.Aborted.Should().BeFalse();
                return;
            }

            if (itemsLockingByCurrentUser.All(i => i == false))
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ItemLockedByAnotherUser);
                args.Aborted.Should().BeTrue();
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldIgnoreLockIfAdmin(
            [Frozen] ISitecoreContext context,
            CheckItemLock sut)
        {
            // arrange
            context.User.IsAdministrator.ReturnsTrue();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID
                },
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipWhenArrayEmpty(
            CheckItemLock sut)
        {
            // arrange

            var args = HorizonSaveItemArgs.Create();
            args.Items = new HorizonArgsSaveItem[0];

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            CheckItemLock sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }

        private static Item MockLockedItem(bool isLocked, bool hasLock)
        {
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.IsLocked().Returns(isLocked);
            item.Locking.HasLock().Returns(hasLock);
            return item;
        }
    }
}
