// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Data;
using Sitecore.Data.Engines;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Pipelines.Save;
using Xunit;
using CheckBaseTemplateFieldChange = Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem.CheckBaseTemplateFieldChange;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.HorizonSaveItem
{
    public class CheckBaseTemplateFieldChangeTests
    {
        [Theory]
        [AutoNData]
        internal void Process_ShouldAbortWhenBaseTemplateChanged(
            [Frozen] ISitecoreContext context,
            CheckBaseTemplateFieldChange sut)
        {
            // arrange
            var database = Substitute.For<Database>();
            var databaseEngines = Substitute.For<DatabaseEngines>(database);
            var templateEngine = Substitute.For<TemplateEngine>(database);
            databaseEngines.TemplateEngine.Returns(templateEngine);
            database.Engines.Returns(databaseEngines);

            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, database);
            templateEngine.IsTemplate(item).ReturnsTrue();
            item[FieldIDs.BaseTemplate].Returns("base test template");

            var field = Substitute.For<Field>(FieldIDs.BaseTemplate, item);
            item.Fields.Returns(Substitute.For<FieldCollection>(item));
            item.Fields[FieldIDs.BaseTemplate].Returns(field);

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
                            ID = FieldIDs.BaseTemplate,
                            Value = "changed base template"
                        }
                    }
                }
            };

            //act
            sut.Process(ref args);

            // assert
            args.Errors.Should().Contain(error => error.ErrorCode == SaveItemErrorCode.BaseTemplateWasChanged);
            args.Aborted.Should().BeTrue();
        }

        [Theory]
        [AutoNData]
        internal void Process_ShouldSkipIfNoItem(
            [Frozen] BaseItemManager itemManager,
            CheckBaseTemplateFieldChange sut)
        {
            // arrange
            itemManager.GetItem(Arg.Any<ID>(), Arg.Any<Language>(), Arg.Any<Version>(), Arg.Any<Database>()).ReturnsNull();

            var args = HorizonSaveItemArgs.Create();
            args.Items = new[]
            {
                new HorizonArgsSaveItem
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
