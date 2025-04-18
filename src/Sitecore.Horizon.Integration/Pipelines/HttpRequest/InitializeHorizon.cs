// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Pipelines.HttpRequest;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.HttpRequest
{
    [PipelineProcessor]
    internal class InitializeHorizon : HttpRequestProcessor
    {
        private readonly IHorizonInitializer _horizonInitializer;
        private readonly IHorizonInternalContext _horizonContext;

        private readonly DeviceResolver _deviceResolver = new DeviceResolver();

        public InitializeHorizon(IHorizonInitializer horizonInitializer, IHorizonInternalContext horizonContext)
        {
            Assert.ArgumentNotNull(horizonInitializer, nameof(horizonInitializer));

            _horizonInitializer = horizonInitializer;
            _horizonContext = horizonContext;
        }

        public override void Process(HttpRequestArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            _horizonInitializer.InitializeHorizonHeadless(args.HttpContext);

            if (_horizonContext.GetHeadlessMode() == HeadlessMode.Api)
            {
                _deviceResolver.Process(args);
                args.AbortPipeline();
            }
        }
    }
}
