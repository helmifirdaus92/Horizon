// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Xunit;
using NewVersion = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.NewVersion;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class NewVersionTests
    {
        [Theory]
        [AutoNData]
        internal void Process_CreateNewVersionIfNeeded(
            [Frozen] BaseItemManager itemManager,
            NewVersion sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());

            itemManager.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

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
            args.Aborted.Should().BeFalse();
        }
    }
}
