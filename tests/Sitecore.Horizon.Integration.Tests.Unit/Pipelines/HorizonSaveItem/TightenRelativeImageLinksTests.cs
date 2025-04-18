// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Xunit;
using TightenRelativeImageLinks = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.TightenRelativeImageLinks;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class TightenRelativeImageLinksTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldTightenLinks(
            [Frozen] BaseItemManager itemManager,
            TightenRelativeImageLinks sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());

            var fieldId = ID.NewID;
            var field = Substitute.For<Field>(fieldId, item);
            field.TypeKey.Returns("html");
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[fieldId].Returns(field);
            item[fieldId].Returns("aaa-bbb-ccc");

            itemManager.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);
            var saveFieldValue = "<a scr='www.google.com'>google</a><img>someImage</img>";

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
                            ID = fieldId,
                            Value = saveFieldValue
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);
        }


        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            TightenRelativeImageLinks sut)
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
    }
}
