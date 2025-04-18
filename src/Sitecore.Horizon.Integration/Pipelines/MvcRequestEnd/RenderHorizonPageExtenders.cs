// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.IO;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Mvc.Pipelines.Request.RequestEnd;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Pipelines.MvcRequestEnd
{
    [UsedInConfiguration]
    internal class RenderHorizonPageExtenders : RequestEndProcessor
    {
        private readonly IHorizonPipelines _horizonPipelines;
        private readonly IHorizonInternalContext _horizonContext;
        private readonly ISitecoreContext _context;

        public RenderHorizonPageExtenders(IHorizonPipelines horizonPipelines, IHorizonInternalContext horizonContext, ISitecoreContext sitecoreContext)
        {
            _horizonPipelines = horizonPipelines;
            _horizonContext = horizonContext;
            _context = sitecoreContext;
        }

        public override void Process(RequestEndArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (_horizonContext.GetHeadlessMode() is HeadlessMode.Disabled or HeadlessMode.Api)
            {
                return;
            }

            if (!_context.User.IsAuthenticated && _horizonContext.GetHeadlessMode() is HeadlessMode.Edit)
            {
                return;
            }

            HttpResponseBase httpResponse = args.PageContext.RequestContext.HttpContext.Response;
            if (httpResponse.Filter == null)
            {
                return;
            }

            var pageExtendersArgs = BuildHorizonPageExtendersArgs.Create();
            _horizonPipelines.BuildHorizonPageExtenders(ref pageExtendersArgs);

            string bodyContent = pageExtendersArgs.BodyContent.ToString();
            if (!string.IsNullOrEmpty(bodyContent))
            {
                httpResponse.Filter = new ResponseFilterStream(httpResponse.Filter, httpResponse.ContentEncoding)
                {
                    BodyContent = bodyContent
                };
            }
        }
    }
}
