// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Pipelines.GetComponents;
using Sitecore.Pipelines.GetRenderingDatasource;
using Sitecore.Pipelines.GetRootSourceItems;
using Sitecore.Pipelines.NormalizePlaceholderKey;
using Sitecore.Pipelines.ResolveRenderingDatasource;

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal static class PlatformPipelineExtensions
    {
        public static PlatformPipelines Platform(this BaseCorePipelineManager pipelineManager)
        {
            Assert.ArgumentNotNull(pipelineManager, nameof(pipelineManager));

            return new PlatformPipelines(pipelineManager);
        }
    }

    [SuppressMessage("Microsoft.Performance", "CA1815:OverrideEqualsAndOperatorEqualsOnValueTypes", Justification = "Pipeline extension does not need equality operations.")]
    internal struct PlatformPipelines
    {
        private readonly BaseCorePipelineManager _pipelineManager;

        public PlatformPipelines(BaseCorePipelineManager pipelineManager)
        {
            _pipelineManager = pipelineManager;
        }

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void NormalizePlaceholderKey(NormalizePlaceholderKeyArgs args) => _pipelineManager.Run("normalizePlaceholderKey", args);

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void GetRootSourceItems(GetRootSourceItemsArgs args) => _pipelineManager.Run("getRootSourceItems", args);

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void GetRenderingDatasource(GetRenderingDatasourceArgs args) => _pipelineManager.Run("getRenderingDatasource", args);

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void ResolveRenderingDataSource(ResolveRenderingDatasourceArgs args) => _pipelineManager.Run("resolveRenderingDatasource", args);

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void GetComponents(GetComponentsArgs args) => _pipelineManager.Run("getComponents", args);
    }
}
