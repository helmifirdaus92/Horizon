// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using System.Web;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;

namespace Sitecore.Horizon.Integration.Web
{
    internal class HorizonCspManager : IHorizonCspManager
    {
        private readonly string _frameAncestors;

        public HorizonCspManager(BaseCorePipelineManager pipelineManager)
        {
            var args = new CollectIFrameAllowedDomainsArgs();
            pipelineManager.Horizon().CollectIFrameAllowedDomains(args);

            _frameAncestors = string.Join(" ", args.AllowedDomains);
        }

        public void AddFrameAncestors(HttpContextBase context)
        {
            if (context.Response.Headers.AllKeys.All(key => key != "Content-Security-Policy")
               || !context.Response.Headers["Content-Security-Policy"].Contains("frame-ancestors")
            )
            {
                context.Response.Headers.Add("Content-Security-Policy", "frame-ancestors " + _frameAncestors);
            }
        }
    }
}
