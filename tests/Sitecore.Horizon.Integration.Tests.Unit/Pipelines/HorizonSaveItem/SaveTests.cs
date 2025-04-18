// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Sitecore.StringExtensions;
using Sitecore.Web;
using Xunit;
using Save = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.Save;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class SaveTests
    {
        [Theory]
        [InlineAutoNData("_changed<script>alert('script found')</script>")]
        [InlineAutoNData("")]
        internal void Process_ShouldSaveChangedFields(
            string fieldChange,
            [Frozen] ISitecoreContext context,
            Save sut)
        {
            // arrange
            var richTextfieldId = ID.NewID;
            var richTextValue = "richTextValue";

            var fields = new List<KeyValuePair<ID, string>>()
            {
                new KeyValuePair<ID, string>(ID.NewID, "originalValue1"),
                new KeyValuePair<ID, string>(ID.NewID, "originalValue2"),
                new KeyValuePair<ID, string>(ID.NewID, "originalValue3"),
                new KeyValuePair<ID, string>(richTextfieldId, richTextValue),
                new KeyValuePair<ID, string>(FieldIDs.DisplayName, "originalDisplayName")
            };
            var item = ItemMockHelper.MockItemWithFields(ID.NewID, fields, true);
            var richTextField = ItemMockHelper.MockFieldForItem(item, richTextfieldId, richTextValue, true, "rich text");


            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var saveFields = fields.Select(f => new HorizonArgsSaveField()
            {
                ID = f.Key,
                Value = f.Value + fieldChange
            });

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Fields = saveFields.ToList()
                },
            };

            //act
            sut.Process(ref args);

            if (fieldChange.IsNullOrEmpty())
            {
                args.SavedItems.Count.Should().Be(1);
                args.Aborted.Should().BeFalse();
            }
            else
            {
                args.SavedItems.Count.Should().Be(1);
                foreach (var field in fields)
                {
                    if (field.Key == richTextField.ID)
                    {
                        args.SavedItems[0].Fields.FirstOrDefault(x => x.ID == field.Key)?.Value.Should().Be(field.Value + WebUtil.RemoveAllScripts(fieldChange));
                    }
                    else if (field.Key == FieldIDs.DisplayName)
                    {
                        args.SavedItems[0].Fields.FirstOrDefault(x => x.ID == field.Key)?.Value.Should().Be((field.Value + fieldChange).Replace("<", "&lt;").Replace(">", "&gt;"));
                    }
                    else
                    {
                        args.SavedItems[0].Fields.FirstOrDefault(x => x.ID == field.Key)?.Value.Should().Be(field.Value + fieldChange);
                    }
                }
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            Save sut)
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
            args.SavedItems.Count.Should().Be(0);
            args.Aborted.Should().BeFalse();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoField(
            [Frozen] BaseItemManager itemManager,
            Save sut)
        {
            // arrange
            var item = ItemMockHelper.MockItemWithFields(ID.NewID, new List<KeyValuePair<ID, string>>
            {
                new KeyValuePair<ID, string>(ID.NewID, "originalValue1"),
                new KeyValuePair<ID, string>(ID.NewID, "originalValue2")
            }, true);
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).Returns(item);

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
                            ID = ID.NewID,
                            Value = "newValue"
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.SavedItems.Count.Should().Be(0);
            args.Aborted.Should().BeFalse();
        }
    }
}
