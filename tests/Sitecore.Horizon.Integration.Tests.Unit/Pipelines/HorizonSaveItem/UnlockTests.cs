// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
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
using Unlock = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.Unlock;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class UnlockTests
    {
        [Theory]
        [InlineAutoNData(true, true, false, true)]
        [InlineAutoNData(true, false, false, true)]
        internal void Process_ShouldUnlockIfLocked(
            bool isLocked,
            bool hasLock,
            bool isAdmin,
            bool shouldUnlock,
            [Frozen] ISitecoreContext context,
            [Frozen] BaseClient client,
            Unlock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            context.User.IsAdministrator.Returns(isAdmin);

            var locking = Substitute.For<ItemLocking>(item);
            locking.IsLocked().Returns(isLocked);
            locking.HasLock().Returns(hasLock);
            item.Locking.Returns(locking);

            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = FieldIDs.Lock,
                            Value = ""
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            locking.Received(shouldUnlock ? 1 : 0).Unlock();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            Unlock sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns((Item)null);

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

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfAdminAndLocked(
            [Frozen] BaseItemManager itemManager,
            Unlock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.IsLocked().ReturnsTrue();
            item.Locking.HasLock().ReturnsFalse();
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

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
            item.Locking.Received(0).Unlock();
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldReturnExceptionWhenThrown(
            [Frozen] BaseSettings settings,
            [Frozen] ISitecoreContext context,
            Unlock sut)
        {
            // arrange
            var exceptionMessage = "test exception";
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.Unlock().ThrowsForAnyArgs(new Exception(exceptionMessage));
            context.User.IsInRole(Arg.Any<string>()).ReturnsFalse();
            context.ContentDatabase.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Errors.Should().Contain(x => x.ErrorCode == SaveItemErrorCode.InternalError);
            args.Aborted.Should().BeTrue();
        }
    }
}
