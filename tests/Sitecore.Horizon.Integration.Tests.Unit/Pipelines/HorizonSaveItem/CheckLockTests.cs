// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

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
using CheckLock = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.CheckLock;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckLockTests
    {
        [Theory]
        [InlineAutoNData(true, true)]
        [InlineAutoNData(false, false)]
        internal void Process_ShouldReturnCorrectResultForLockedItems(
            bool isLocked,
            bool shouldAbort,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseTemplateManager templateManager,
            CheckLock sut)
        {
            // arrange
            var database = Substitute.For<Database>();

            var itemA = Substitute.For<Item>(ID.NewID, ItemData.Empty, database);
            itemA.Locking.Returns(Substitute.For<ItemLocking>(itemA));
            itemA.Locking.IsLocked().Returns(isLocked);
            itemA.Locking.GetOwnerWithoutDomain().Returns("testOwner");

            templateManager.IsFieldPartOfTemplate(Arg.Any<ID>(), itemA).ReturnsTrue();
            context.ContentDatabase.GetItem(itemA.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(itemA);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = itemA.ID
                },
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().Be(shouldAbort);
            if (isLocked)
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ItemLockedByAnotherUser);
            }
            else
            {
                args.Errors.Count.Should().Be(0);
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldIgnoreLockIfAdmin(
            [Frozen] ISitecoreContext context,
            [Frozen] BaseItemManager itemManager,
            [Frozen] BaseTemplateManager templateManager,
            CheckLock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            templateManager.IsFieldPartOfTemplate(Arg.Any<ID>(), item).ReturnsTrue();
            itemManager.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

            context.User.IsAdministrator.ReturnsTrue();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID
                },
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            CheckLock sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

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
    }
}
