// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.GetChromeData;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.NSubstituteUtils;
using Sitecore.Pipelines.GetChromeData;
using Sitecore.Pipelines.NormalizePlaceholderKey;
using Sitecore.Web.UI.PageModes;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines.GetChromeData
{
    public class FillHorizonPlaceholderChromeDataTests
    {
        [Theory, AutoNData]
        internal void Process_ShouldExtendChromeDataWithHorizonPlaceholderChromeData(
            [Frozen] BaseCorePipelineManager pipelineManager,
            FillHorizonPlaceholderChromeData sut,
            ChromeData chromeData,
            string revision,
            FakeItem item,
            string placeholderKey,
            string normalizePlaceholderKey
        )
        {
            // arrange
            item.WithField(FieldIDs.Revision, revision);
            var chromeDataArgs = new GetChromeDataArgs(GetPlaceholderChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            chromeDataArgs.CustomData[GetPlaceholderChromeData.PlaceholderKey] = placeholderKey;

            pipelineManager.Platform().NormalizePlaceholderKey(Arg.Do<NormalizePlaceholderKeyArgs>(x => x.Result = normalizePlaceholderKey));

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;

            custom.Should().ContainKey("placeholderKey").WhichValue.Should().Be(placeholderKey);
            custom.Should().ContainKey("placeholderMetadataKeys")
                .WhichValue.Should().BeOfType<string[]>()
                .Subject.Length.Should().BeGreaterOrEqualTo(1);

            var contextItem = custom.Should().ContainKey("contextItem").WhichValue.Should().BeOfType<HorizonChromeDataItem>().Subject;
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Language.Should().Be(chromeDataArgs.Item.Language.Name);
            contextItem.Version.Should().Be(chromeDataArgs.Item.Version.Number);
            contextItem.Id.Should().Be(chromeDataArgs.Item.ID);
            contextItem.Revision.Should().Be(revision.Replace("-", string.Empty));
        }

        [Theory]
        [InlineAutoNData("inner", "inner")]
        [InlineAutoNData("main/inner", "main/inner")]
        [InlineAutoNData("inner-{33130949-740A-407E-BD1D-4FF6A245CEB8}-0", "inner")]
        [InlineAutoNData("main/inner-{33130949-740A-407E-BD1D-4FF6A245CEB8}-0", "main/inner")]
        internal void Process_ShouldNormalizePlaceholderKey(string placeholderKey,
            string normalizePlaceholderKey,
            [Frozen] BaseCorePipelineManager pipelineManager,
            FillHorizonPlaceholderChromeData sut,
            ChromeData chromeData,
            string revision,
            FakeItem item
        )
        {
            // arrange
            item.WithField(FieldIDs.Revision, revision);
            var chromeDataArgs = new GetChromeDataArgs(GetPlaceholderChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            chromeDataArgs.CustomData[GetPlaceholderChromeData.PlaceholderKey] = placeholderKey;

            pipelineManager.Platform().NormalizePlaceholderKey(Arg.Do<NormalizePlaceholderKeyArgs>(x => x.Result = normalizePlaceholderKey));

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;

            custom.Should().ContainKey("placeholderKey").WhichValue.Should().Be(placeholderKey);
            custom.Should().ContainKey("placeholderMetadataKeys")
                .WhichValue.Should().BeOfType<string[]>()
                .Subject.Should().Contain(normalizePlaceholderKey);
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfChromeTypeIsNotPlaceholder(
            FillHorizonPlaceholderChromeData sut,
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
            custom.Should().NotContainKey("placeholderKey");
            custom.Should().NotContainKey("placeholderMetadataKeys");
            custom.Should().NotContainKey("contextItem");
        }

        [Theory, AutoNData]
        internal void Process_ShouldNotExtendChromeDataIfPlaceholderCustomDataIsNotFound(
            FillHorizonPlaceholderChromeData sut,
            ChromeData chromeData,
            FakeItem item
        )
        {
            // arrange
            var chromeDataArgs = new GetChromeDataArgs(GetPlaceholderChromeData.ChromeType, item)
            {
                ChromeData = chromeData,
            };

            // act
            sut.Process(chromeDataArgs);

            // assert
            var custom = chromeDataArgs.ChromeData.Custom;
            custom.Should().NotContainKey("placeholderKey");
            custom.Should().NotContainKey("placeholderMetadataKeys");
            custom.Should().NotContainKey("contextItem");
        }

        [Theory, AutoNData]
        internal void Process_ShouldThrowOnNullArgs(FillHorizonPlaceholderChromeData sut)
        {
            //act & assert
            sut.Invoking(x => x.Process(null)).Should().Throw<ArgumentNullException>();
        }
    }
}
