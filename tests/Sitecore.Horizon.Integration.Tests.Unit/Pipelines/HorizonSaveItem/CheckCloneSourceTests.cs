// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Clones.ItemSourceUriProviders;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Pipelines.Save;
using Sitecore.StringExtensions;
using Xunit;
using CheckCloneSource = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.CheckCloneSource;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckCloneSourceTests
    {
        [Theory]
        [InlineAutoNData(true, "sourceValue")]
        [InlineAutoNData(false, "sourceValue")]
        [InlineAutoNData(true, "")]
        internal void Process_ShouldAbortIfCloneSourceIsInvalid(
            bool isValidSource,
            string sourceItemValue,
            [Frozen] ISitecoreContext context,
            [Frozen] ISourceUriProvider itemSourceUriProvider,
            [Frozen] BaseSettings settings,
            CheckCloneSource sut)
        {
            // arrange
            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());

            itemSourceUriProvider.IsValidSourceFieldValue(item, sourceItemValue).Returns(isValidSource);
            context.ContentDatabase.GetItem(item.ID, Arg.Any<Language>(), Arg.Any<Version>()).Returns(item);
            settings.ItemCloning().Enabled.ReturnsTrue();

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
                            ID = FieldIDs.SourceItem,
                            Value = sourceItemValue
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            if (!isValidSource)
            {
                args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.IncorrectCloneSource);
                args.Aborted.Should().BeTrue();
            }

            if (sourceItemValue.IsNullOrEmpty())
            {
                args.Aborted.Should().BeFalse();
            }
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldAbortIfItemNotFound(
            [Frozen] BaseItemManager itemManager,
            [Frozen] ISourceUriProvider itemSourceUriProvider,
            [Frozen] BaseSettings settings,
            CheckCloneSource sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();
            settings.ItemCloning().Enabled.ReturnsTrue();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem()
                {
                    ID = ID.NewID,
                    Fields = new List<HorizonArgsSaveField>()
                    {
                        new HorizonArgsSaveField()
                        {
                            ID = FieldIDs.SourceItem,
                            Value = "value"
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.ItemDoesNotExist);
            args.Aborted.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfCloningDisabled(
            [Frozen] BaseSettings settings,
            CheckCloneSource sut)
        {
            // arrange
            settings.ItemCloning().Enabled.ReturnsFalse();

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
