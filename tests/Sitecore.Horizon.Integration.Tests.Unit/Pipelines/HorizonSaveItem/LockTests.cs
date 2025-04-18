// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
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
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.Save;
using Xunit;
using Lock = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.Lock;
using NewVersion = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.NewVersion;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class LockTests
    {
        [Theory]
        [InlineAutoNData(false, false, false, false)]
        [InlineAutoNData(false, true, false, true)]
        internal void Process_ShouldLockIfNotLocked(
            bool hasLock,
            bool isLocked,
            bool isAdmin,
            bool shouldAbort,
            FakeItem item,
            [Frozen] ISitecoreContext context,
            Lock sut)
        {
            // arrange
            var locking = Substitute.For<ItemLocking>(item.ToSitecoreItem());

            item.WithItemVersions();
            item.WithField("Name", "test item");
            item.WithItemLocking(locking);
            locking.HasLock().Returns(hasLock);
            locking.IsLocked().Returns(isLocked);

            context.User.IsAdministrator.Returns(isAdmin);

            context.WorkflowStartEditing(Arg.Any<Item>()).Returns(item.ToSitecoreItem());
            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item.ToSitecoreItem());

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
                            Value = "asd"
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            locking.Received(shouldAbort ? 0 : 1).Lock();
            args.Aborted.Should().Be(shouldAbort);
        }

        [Theory]
        [AutoNData]
        internal void ProcessAutoCreatedNewVersion_ShouldSetNewCreatedVersions(
            FakeItem item,
            [Frozen] ISitecoreContext context,
            Version requesedVersion,
            Lock sut)
        {
            // arrange
            var locking = Substitute.For<ItemLocking>(item.ToSitecoreItem());
            
            item.WithField("Name", "test item");
            item.WithItemLocking(locking);
            item.WithVersion(requesedVersion.Number + 1);

            locking.HasLock().Returns(false);
            locking.IsLocked().Returns(false);

            item.WithItemVersions();
            var sitecoreItem = item.ToSitecoreItem();
            sitecoreItem.Versions.GetVersionNumbers().Returns(new Version[] { });

            context.WorkflowStartEditing(Arg.Any<Item>()).Returns(sitecoreItem);
            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item.ToSitecoreItem());

            var args = HorizonSaveItemArgs.Create();

            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Version = requesedVersion,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = FieldIDs.Lock,
                            Value = "asd"
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.NewCreatedVersions.Count.Should().Be(1);
            args.NewCreatedVersions.Should().Contain(version => version.ItemId == item.ID.Guid);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            Lock sut)
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

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfHasLock(
            [Frozen] BaseItemManager itemManager,
            Lock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.IsLocked().ReturnsTrue();
            item.Locking.HasLock().ReturnsTrue();
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
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoField(
            [Frozen] BaseItemManager itemManager,
            Lock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.IsLocked().ReturnsTrue();
            item.Locking.HasLock().ReturnsTrue();
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
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldReturnExceptionMessage(
            [Frozen] ISitecoreContext context,
            Lock sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Versions.Returns(Substitute.For<ItemVersions>(item));
            item.Locking.Returns(Substitute.For<ItemLocking>(item));
            item.Locking.IsLocked().ReturnsTrue();
            item.Locking.HasLock().ReturnsFalse();
            context.ContentDatabase.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            context.User.IsAdministrator.ReturnsTrue();

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
            args.Errors.Count.Should().Be(1);
            args.Aborted.Should().BeTrue();
        }
    }
}
