// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using AutoFixture.Xunit2;
using DocumentFormat.OpenXml.Spreadsheet;
using FluentAssertions;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Helper;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Pipelines.GetChromeData;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Jobs.AsyncUI;
using Sitecore.Layouts;
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Pipelines.GetContentEditorWarnings;
using Sitecore.Pipelines.GetSyndicationWarnings;
using Sitecore.Security.AccessControl;
using Sitecore.Sites.Headless;
using Sitecore.Web.UI.PageModes;
using Xunit;
using Item = Sitecore.Data.Items.Item;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetChromeData
{
    public class FillHorizonRenderingChromeDataTests
    {
        [Theory]
        [InlineAutoNData(HeadlessMode.Disabled)]
        [InlineAutoNData(HeadlessMode.Api)]
        [InlineAutoNData(HeadlessMode.Preview)]
        internal void Process_ShouldCallProcessFromKernelGetChromeDataForNonHorizonEditMode(
            HeadlessMode headlessMode,
            [Frozen] IHorizonInternalContext horizonContext,
            FillHorizonRenderingChromeData sut
        )
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(headlessMode);

            var chromeDataArgs = new GetChromeDataArgs("NotValidChromeTypeForTheKernelsProcessMethodNotToBreakButReturnRightAway");

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotContainKey("renderingId");
            custom.Should().NotContainKey("renderingInstanceId");
            custom.Should().NotContainKey("contextItem");
            custom.Should().NotContainKey("compatibleRenderings");
        }

        [Theory, AutoNData]
        internal void Process_ShouldExtendChromeDataWithHorizonRenderingChromeData(
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonItemHelper itemHelper,
            FillHorizonRenderingChromeData sut,
            FakeItem referenceInnerItem,
            ChromeData chromeData,
            string revision,
            FakeItem item)
        {
            // arrange
            itemHelper.IsFeaasRendering(Any.Arg<Item>()).Returns(false);
            itemHelper.IsByocRendering(Any.Arg<Item>()).Returns(false);
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            item.WithField(FieldIDs.Revision, revision);
            var chromeDataArgs = new GetChromeDataArgs(GetRenderingChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            referenceInnerItem.WithAppearance();
            var renderingDisplayName = "renderingDisplayName001";
            referenceInnerItem.WithDisplayName(renderingDisplayName);
            referenceInnerItem.WithField("Compatible Renderings", "rendering1|rendering2");
            var renderingReference = new RenderingReference(new RenderingItem(referenceInnerItem));
            chromeDataArgs.CustomData[GetRenderingChromeData.RenderingReferenceKey] = renderingReference;

            // act
            sut.Process(chromeDataArgs);

            // assert
            chromeDataArgs.ChromeData.DisplayName.Should().Be(renderingDisplayName);
            chromeDataArgs.CommandContext.Parameters["referenceId"].Should().Be(renderingReference.UniqueId);

            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotBeNull();

            custom.Should().ContainKey("renderingId").WhichValue.Should().Be(renderingReference.RenderingID);
            custom.Should().ContainKey("renderingInstanceId").WhichValue.Should().Be(renderingReference.UniqueId);
            custom.Should().ContainKey("editable").WhichValue.Should().Be(renderingReference.RenderingItem?.Editable.ToString().ToUpperInvariant());
            custom.Should().ContainKey("compatibleRenderings").WhichValue.Should().Equals(new[] { "rendering1", "rendering2" });

            var contextItem = custom.Should().ContainKey("contextItem").WhichValue.Should().BeOfType<HorizonChromeDataItem>().Subject;
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Language.Should().Be(chromeDataArgs.Item.Language.Name);
            contextItem.Version.Should().Be(chromeDataArgs.Item.Version.Number);
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Revision.Should().Be(revision.Replace("-", string.Empty));
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfChromeTypeIsNotRendering(
            FillHorizonRenderingChromeData sut,
            ChromeData chromeData,
            string chromeType,
            FakeItem item
        )
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
            custom.Should().NotContainKey("renderingId");
            custom.Should().NotContainKey("renderingInstanceId");
            custom.Should().NotContainKey("contextItem");
            custom.Should().NotContainKey("compatibleRenderings");
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfRenderingReferencedCustomDataIsNotFound(
            [Frozen] IHorizonInternalContext horizonContext,
            FillHorizonRenderingChromeData sut,
            ChromeData chromeData,
            FakeItem item
        )
        {
            // arrange
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            var chromeDataArgs = new GetChromeDataArgs(GetRenderingChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotContainKey("renderingId");
            custom.Should().NotContainKey("renderingInstanceId");
            custom.Should().NotContainKey("contextItem");
            custom.Should().NotContainKey("compatibleRenderings");
        }

        [Theory]
        [InlineAutoNData(true, false, false)]
        [InlineAutoNData(false, true, false)]
        [InlineAutoNData(true, true, true)]
        internal void Process_ShouldSetEditableToFalseWhenUserHasNoWritePermissions(
            bool canWrite,
            bool canWriteLanguage,
            bool expectedEditable,
            [Frozen] IHorizonInternalContext horizonContext,
            [Frozen] IHorizonItemHelper itemHelper,
            FillHorizonRenderingChromeData sut,
            ChromeData chromeData,
            FakeItem referenceInnerItem,
            Data.Version version,
            Language language

        )
        {
            // arrange
            itemHelper.IsFeaasRendering(Any.Arg<Item>()).Returns(false);
            itemHelper.IsByocRendering(Any.Arg<Item>()).Returns(false);
            horizonContext.GetHeadlessMode().Returns(HeadlessMode.Edit);

            var item = Substitute.For<Item>(ID.NewID, ItemData.Empty, Substitute.For<Database>());

            var itemAccess = Substitute.For<ItemAccess>(item);
            itemAccess.CanWrite().Returns(canWrite);
            itemAccess.CanWriteLanguage().Returns(canWriteLanguage);
            item.Access.Returns(itemAccess);
            item.Version.Returns(version);
            item.Language.Returns(language);
            item[FieldIDs.Revision].Returns("abcd-revision");

            var chromeDataArgs = new GetChromeDataArgs(GetRenderingChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            referenceInnerItem.WithAppearance();
            referenceInnerItem.WithDisplayName("renderingDisplayName001");
            referenceInnerItem.WithField("Compatible Renderings", "rendering1|rendering2");
            referenceInnerItem.WithField("Editable", "1");
            var renderingReference = new RenderingReference(new RenderingItem(referenceInnerItem));
            chromeDataArgs.CustomData[GetRenderingChromeData.RenderingReferenceKey] = renderingReference;

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().ContainKey("editable").WhichValue.Should().Be(expectedEditable.ToString().ToUpper());
        }

        [Theory, AutoNData]
        internal void Process_ShouldThrowOnNullArgs(FillHorizonRenderingChromeData sut)
        {
            //act & assert
            sut.Invoking(x => x.Process(null)).Should().Throw<ArgumentNullException>();
        }
    }
}
