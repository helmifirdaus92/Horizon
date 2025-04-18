// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Context;
using Sitecore.Sites.Headless;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class DisableHorizonForExperienceApplications : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        public void Process(ref ResolveHorizonModeArgs args)
        {
            if (WebUtil.GetQueryString("sc_mode", null, args.HttpContext) != null)
            {
                args.SetResultAndAbortPipeline(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled)));
            }
        }
    }
}
