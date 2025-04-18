// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.Save;
using Xunit;
using CheckTemplateFieldChange = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.CheckTemplateFieldChange;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckTemplateFieldChangeTests
    {
        [Theory]
        [InlineAutoNData("oldValue", "newValue")]
        [InlineAutoNData("oldValue", "oldValue")]
        internal void Process_ShouldAbortWhenSharedFlagChanged(
            string oldValue,
            string newValue,
            [Frozen] ISitecoreContext context,
            CheckTemplateFieldChange sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item[FieldIDs.BaseTemplate].Returns("base test template");
            item.TemplateID.Returns(TemplateIDs.TemplateField);

            var field = Substitute.For<Field>(TemplateFieldIDs.Shared, item);
            field.Value.Returns(oldValue);
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[TemplateFieldIDs.Shared].Returns(field);

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
                            ID = TemplateFieldIDs.Shared,
                            Value = newValue
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            if (oldValue == newValue)
            {
                args.Aborted.Should().BeFalse();
            }
            else
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ChangedUnversionedOrSharedFlag);
                args.Aborted.Should().BeTrue();
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            CheckTemplateFieldChange sut)
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
        [InlineAutoNData("oldValue", "newValue")]
        [InlineAutoNData("oldValue", "oldValue")]
        internal void Process_ShouldAbortWhenUnversionedFlagChanged(
            string oldValue,
            string newValue,
            [Frozen] ISitecoreContext context,
            CheckTemplateFieldChange sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());
            item[FieldIDs.BaseTemplate].Returns("base test template");
            item.TemplateID.Returns(TemplateIDs.TemplateField);

            var field = Substitute.For<Field>(TemplateFieldIDs.Unversioned, item);
            field.Value.Returns(oldValue);
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[TemplateFieldIDs.Unversioned].Returns(field);

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
                            ID = TemplateFieldIDs.Unversioned,
                            Value = newValue
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            if (newValue == oldValue)
            {
                args.Aborted.Should().BeFalse();
            }
            else
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ChangedUnversionedOrSharedFlag);
                args.Aborted.Should().BeTrue();
            }
        }
    }
}
