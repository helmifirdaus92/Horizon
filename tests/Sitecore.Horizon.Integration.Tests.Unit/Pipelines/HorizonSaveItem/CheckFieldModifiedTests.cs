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
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.Save;
using Sitecore.StringExtensions;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckFieldModifiedTests
    {
        [Theory]
        [InlineAutoNData("oldRevision", "modifiedRevision", "originalFieldValue", "originalFieldValue")]
        [InlineAutoNData("oldRevision", "modifiedRevision", "originalFieldValue", "modifiedlFieldValue")]
        [InlineAutoNData("oldRevision", "oldRevision", "originalFieldValue", "modifiedOriginalFieldValue")]
        [InlineAutoNData("oldRevision", "", "originalFieldValue", "modifiedOriginalFieldValue")]
        internal void Process_ShouldCheckRevisionAndFieldDifference(
            string oldRevision,
            string newRevision,
            string itemFieldValue,
            string saveOriginalValue,
            [Frozen] ISitecoreContext context,
            CheckFieldModified sut,
            FakeItem fakeItem)
        {
            // arrange
            fakeItem.WithStatistics();
            fakeItem.WithField(FieldIDs.DisplayName, itemFieldValue);
            fakeItem.WithField(FieldIDs.Revision, oldRevision);
            fakeItem.WithItemVersions();

            var item = fakeItem.ToSitecoreItem();

            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = item.ID,
                    Revision = newRevision,
                    Fields = new List<HorizonArgsSaveField>() {new HorizonArgsSaveField(){ID = FieldIDs.DisplayName, OriginalValue = saveOriginalValue, Value = "test"} }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            if (oldRevision == newRevision || newRevision.IsNullOrEmpty())
            {
                args.Aborted.Should().BeFalse();
                args.Warnings.Should().BeEmpty();
                args.Errors.Should().BeEmpty();
            }
            else if(saveOriginalValue == itemFieldValue)
            {
                args.Warnings.Should().Contain(warning => warning == SaveItemErrorCode.ItemWasModified.ToString());
                args.Aborted.Should().BeFalse();
                args.Errors.Should().BeEmpty();
            }
            else
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.FieldWasModified);
                args.Aborted.Should().BeTrue();
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem([Frozen] BaseItemManager itemManager, CheckFieldModified sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID,
                    Revision = "newValue"
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Aborted.Should().BeFalse();
        }
    }
}
