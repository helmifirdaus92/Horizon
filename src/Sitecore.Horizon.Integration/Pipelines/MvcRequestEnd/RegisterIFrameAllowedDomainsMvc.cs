// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Mvc.Pipelines.Request.RequestEnd;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.MvcRequestEnd
{
    [PipelineProcessor]
    internal class RegisterIFrameAllowedDomainsMvc : RequestEndProcessor
    {
        private readonly IHorizonCspManager _horizonCspManager;
        private readonly IHorizonInternalContext _horizonContext;

        public RegisterIFrameAllowedDomainsMvc(BaseCorePipelineManager pipelineManager, IHorizonCspManager horizonCspManager, IHorizonInternalContext horizonContext)
        {
            Assert.ArgumentNotNull(pipelineManager, nameof(pipelineManager));
            Assert.ArgumentNotNull(horizonCspManager, nameof(horizonCspManager));

            _horizonCspManager = horizonCspManager;
            _horizonContext = horizonContext;
        }

        public override void Process(RequestEndArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (_horizonContext.GetHeadlessMode() is HeadlessMode.Disabled or HeadlessMode.Api)
            {
                return;
            }

            _horizonCspManager.AddFrameAncestors(args.PageContext.RequestContext.HttpContext);
        }
    }
}
