// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Web;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class ResolveRequestStateFromQueryStringOrCookie : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        private readonly ISitecoreContext _sitecoreContext;
        private readonly IHorizonRequestHelper _requestHelper;

        public ResolveRequestStateFromQueryStringOrCookie(ISitecoreContext sitecoreContext, IHorizonRequestHelper requestHelper)
        {
            _sitecoreContext = sitecoreContext;
            _requestHelper = requestHelper;
        }

        public void Process(ref ResolveHorizonModeArgs args)
        {
            args.RequestState ??= _sitecoreContext.HeadlessContext.GetStateFromQueryStringOrCookie();

            // For legacy and horizon host
            args.HorizonRequestState ??= _requestHelper.GetHorizonRequestStateFromQueryStringOrCookie(args.HttpContext);
        }
    }
}
