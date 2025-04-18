// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;

namespace Sitecore.Horizon.Integration.Pipelines
{
    internal static class HorizonConfigurablePipelineExtensions
    {
        public static HorizonConfigurablePipelines Horizon(this BaseCorePipelineManager pipelineManager)
        {
            Assert.ArgumentNotNull(pipelineManager, nameof(pipelineManager));

            return new HorizonConfigurablePipelines(pipelineManager);
        }
    }

    [SuppressMessage("Microsoft.Performance", "CA1815:OverrideEqualsAndOperatorEqualsOnValueTypes", Justification = "Pipeline extension does not need equality operations.")]
    internal readonly struct HorizonConfigurablePipelines
    {
        public const string PipelineGroupName = "Horizon";
        private readonly BaseCorePipelineManager _pipelineManager;

        public HorizonConfigurablePipelines(BaseCorePipelineManager pipelineManager)
        {
            _pipelineManager = pipelineManager;
        }

        [SuppressMessage("Microsoft.Design", "CA1011:ConsiderPassingBaseTypesAsParameters", Justification = "Correct arg type is required here to be consistent with pipeline.")]
        public void CollectIFrameAllowedDomains(CollectIFrameAllowedDomainsArgs args) => _pipelineManager.Run("collectIFrameAllowedDomains", args, PipelineGroupName);
    }
}
