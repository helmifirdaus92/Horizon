// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Sitecore.Security.AccessControl;
using Xunit;
using HasWritePermission = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.HasWritePermission;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class HasWritePermissionTests
    {
        [Theory]
        [InlineAutoNData(true, true, true, false, true)]
        [InlineAutoNData(false, true, false, false, true)]
        [InlineAutoNData(true, false, false, false, true)]
        [InlineAutoNData(true, true, false, false, false)]
        [InlineAutoNData(true, true, false, true, true)]
        internal void Process_ShouldCheckWriteAccess(
            bool canWrite,
            bool canWriteLanguage,
            bool readOnly,
            bool fallback,
            bool shouldAbort,
            [Frozen] ISitecoreContext context,
            HasWritePermission sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item.Name = "test item";
            var itemAccess = Substitute.For<ItemAccess>(item);
            var itemApperance = Substitute.For<ItemAppearance>(item);
            itemApperance.ReadOnly.Returns(readOnly);
            itemAccess.CanWrite().Returns(canWrite);
            itemAccess.CanWriteLanguage().Returns(canWriteLanguage);
            item.Appearance.Returns(itemApperance);
            item.Access.Returns(itemAccess);
            item.IsFallback.Returns(fallback);

            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Revision = "bbb-ccc-ddd"
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().Be(shouldAbort);
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldAbortIfItemNotFound(
            [Frozen] BaseItemManager itemManager,
            HasWritePermission sut)
        {
            // arrange

            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID,
                    Revision = "bbb-ccc-ddd"
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ItemDoesNotExist);
            args.Aborted.Should().BeTrue();
        }
    }
}
