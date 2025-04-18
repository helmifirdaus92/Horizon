// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Web;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class ResolveHorizonModePipeline : IHorizonPipeline<ResolveHorizonModeArgs>
    {
        public ResolveHorizonModePipeline(IHorizonRequestHelper requestHelper, ISitecoreContext sitecoreContext, BaseSettings settings, BaseCorePipelineManager pipelineManager)
        {
            Processors = new IHorizonPipelineProcessor<ResolveHorizonModeArgs>[]
            {
                new IgnoreInternalSite(),
                new ResolveRequestStateFromQueryStringOrCookie(sitecoreContext, requestHelper),
                new CopyRequestStateFromLegacyParameter(),
                new CheckRequestedMode(),
                new DisableHorizonForExperienceApplications(),
                new EnsureHorizonHostIsAllowed(settings, pipelineManager),
                new EnableHorizonMode()
            };
        }

        public IHorizonPipelineProcessor<ResolveHorizonModeArgs>[] Processors { get; }
    }
}
