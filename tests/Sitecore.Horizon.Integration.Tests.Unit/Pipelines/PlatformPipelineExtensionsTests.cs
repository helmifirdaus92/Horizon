// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Pipelines.GetRenderingDatasource;
using Sitecore.Pipelines.GetRootSourceItems;
using Sitecore.Pipelines.NormalizePlaceholderKey;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines
{
    public class PlatformPipelineExtensionsTests
    {
        [Theory, AutoNData]
        internal void NormalizePlaceholderKey_ShouldCallPipeline(
            BaseCorePipelineManager pipelineManager,
            NormalizePlaceholderKeyArgs args)
        {
            // arrange

            // act
            pipelineManager.Platform().NormalizePlaceholderKey(args);

            // assert
            pipelineManager.Received().Run("normalizePlaceholderKey", args);
        }

        [Theory, AutoNData]
        internal void GetRootSourceItems_ShouldCallPipeline(
            BaseCorePipelineManager pipelineManager,
            GetRootSourceItemsArgs args)
        {
            // arrange

            // act
            pipelineManager.Platform().GetRootSourceItems(args);

            // assert
            pipelineManager.Received().Run("getRootSourceItems", args);
        }

        [Theory, AutoNData]
        internal void GetRenderingDataSource_ShouldCallPipeline(
            BaseCorePipelineManager pipelineManager,
            GetRenderingDatasourceArgs args)
        {
            // arrange
            // act
            pipelineManager.Platform().GetRenderingDatasource(args);

            // assert
            pipelineManager.Received().Run("getRenderingDatasource", args);
        }
    }
}
