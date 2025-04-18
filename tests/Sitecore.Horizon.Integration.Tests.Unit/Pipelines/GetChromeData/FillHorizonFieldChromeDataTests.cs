// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Pipelines.GetChromeData;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Sites.Headless;
using Sitecore.Web.UI.PageModes;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetChromeData
{
    public class FillHorizonFieldChromeDataTests
    {
        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void Process_ShouldCallProcessFromKernelGetChromeDataForNonHorizonEditMode(
            HeadlessMode horizonMode,
            [Frozen] IHorizonInternalContext horizonContext,
            FillHorizonFieldChromeData sut
        )
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(horizonMode);
            var chromeDataArgs = new GetChromeDataArgs("NotValidChromeTypeForTheKernelsProcessMethodNotToBreakButReturnRightAway");

            // act
            sut.Process(chromeDataArgs);

            // assert
            chromeDataArgs.ChromeData.Custom.Should().NotContainKey("fieldId");
            chromeDataArgs.ChromeData.Custom.Should().NotContainKey("contextItem");
        }

        [Theory, AutoNData]
        internal void Process_ShouldExtendChromeDataWithHorizonFieldChromeData(
            [Frozen] IHorizonInternalContext horizonContext,
            FillHorizonFieldChromeData sut,
            ChromeData chromeData,
            FakeItem item
        )
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            item.WithField(FieldIDs.Revision, "ecd0a6fe-6e4e-4de0-bd20-fdea1173114a");
            var chromeDataArgs = new GetChromeDataArgs(GetFieldChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            var field = Substitute.For<Field>(ID.NewID, item.ToSitecoreItem());
            field.Type.Returns("html");
            chromeDataArgs.CustomData[GetFieldChromeData.FieldKey] = field;

            // act
            sut.Process(chromeDataArgs);

            // assert
            chromeDataArgs.ChromeData.DisplayName.Should().Be(field.DisplayName);

            var custom = chromeDataArgs.ChromeData.Custom;

            custom.Should().ContainKey("fieldId").WhichValue.Should().Be(field.ID.Guid.ToString());
            custom.Should().ContainKey("fieldType").WhichValue.Should().Be(field.Type);

            var contextItem = custom.Should().ContainKey("contextItem").WhichValue.Should().BeOfType<HorizonChromeDataItem>().Subject;
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Language.Should().Be(chromeDataArgs.Item.Language.Name);
            contextItem.Version.Should().Be(chromeDataArgs.Item.Version.Number);
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Revision.Should().NotContain("-").And.NotBeEmpty();
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfChromeTypeIsNotField(
            FillHorizonFieldChromeData sut,
            ChromeData chromeData,
            FakeItem item,
            string chromeType)
        {
            // arrange
            var chromeDataArgs = new GetChromeDataArgs(chromeType, item)
            {
                ChromeData = chromeData,
            };

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotContainKey("fieldId");
            custom.Should().NotContainKey("fieldType");
            custom.Should().NotContainKey("fieldType");
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfFieldCustomDataIsNotFound(
            [Frozen] IHorizonInternalContext horizonContext,
            FillHorizonFieldChromeData sut,
            ChromeData chromeData,
            FakeItem item
        )
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            var chromeDataArgs = new GetChromeDataArgs(GetFieldChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotContainKey("fieldId");
            custom.Should().NotContainKey("fieldType");
            custom.Should().NotContainKey("fieldType");
        }

        [Theory, AutoNData]
        internal void Process_ShouldThrowOnNullArgs(FillHorizonFieldChromeData sut)
        {
            //act & assert
            sut.Invoking(x => x.Process(null)).Should().Throw<ArgumentNullException>();
        }
    }
}
