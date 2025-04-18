// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Sites;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal struct ResolveHorizonModeArgs : IHorizonPipelineArgs
    {
        public bool Aborted { get; set; }

        public HttpContextBase HttpContext { get; init; }

        public SiteContext Site { get; init; }

        public HeadlessModeParametersWithHorizonHost Result { get; private set; }

        public HeadlessRequestState? RequestState { get; set; }

        public HorizonRequestState? HorizonRequestState { get; set; }

        public static ResolveHorizonModeArgs Create(HttpContextBase httpContext, SiteContext site)
        {
            return new()
            {
                HttpContext = httpContext,
                Site = site,
                Result = new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Disabled))
            };
        }

        public void SetResult(HeadlessModeParametersWithHorizonHost result)
        {
            Result = result;
        }

        public void SetResultAndAbortPipeline(HeadlessModeParametersWithHorizonHost result)
        {
            Result = result;
            Aborted = true;
        }
    }
}
