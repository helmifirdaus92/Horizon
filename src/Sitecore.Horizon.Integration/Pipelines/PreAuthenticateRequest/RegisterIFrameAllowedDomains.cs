// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Pipelines.HttpRequest;

namespace Sitecore.Horizon.Integration.Pipelines.PreAuthenticateRequest
{
    [PipelineProcessor]
    internal class RegisterIFrameAllowedDomains : HttpRequestProcessor
    {
        private readonly IHorizonCspManager _horizonCspManager;

        public RegisterIFrameAllowedDomains(IHorizonCspManager horizonCspManager)
        {
            Assert.ArgumentNotNull(horizonCspManager, nameof(horizonCspManager));

            _horizonCspManager = horizonCspManager;
        }

        public override void Process(HttpRequestArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            _horizonCspManager.AddFrameAncestors(args.HttpContext);
        }
    }
}
