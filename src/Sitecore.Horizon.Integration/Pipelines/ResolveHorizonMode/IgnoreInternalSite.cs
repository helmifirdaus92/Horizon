// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class IgnoreInternalSite : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        public void Process(ref ResolveHorizonModeArgs args)
        {
            if (args.Site.SiteInfo.IsInternal)
            {
                args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
            }
        }
    }
}
