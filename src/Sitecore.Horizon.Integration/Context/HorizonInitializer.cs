// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using Sitecore.Horizon.Integration.Modes;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Security.Accounts;
using Sitecore.Sites;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Context
{
    internal class HorizonInitializer : IHorizonInitializer
    {
        private readonly ISitecoreContextHelper _sitecoreContextHelper;
        private readonly IHorizonInternalContext _horizonContext;
        private readonly IHorizonRequestHelper _horizonRequestHelper;
        private readonly IHorizonModeHandlerResolver _modeHandlerResolver;
        private readonly IHorizonPipelines _horizonPipelines;

        public HorizonInitializer(
            ISitecoreContextHelper sitecoreContextHelper,
            IHorizonInternalContext horizonContext,
            IHorizonRequestHelper horizonRequestHelper,
            IHorizonModeHandlerResolver modeHandlerResolver,
            IHorizonPipelines horizonPipelines)
        {
            _sitecoreContextHelper = sitecoreContextHelper;
            _horizonContext = horizonContext;
            _horizonRequestHelper = horizonRequestHelper;
            _modeHandlerResolver = modeHandlerResolver;
            _horizonPipelines = horizonPipelines;
        }

        public void InitializeHorizonHeadless(HttpContextBase? httpContext)
        {
            SiteContext? contextSite = _sitecoreContextHelper.Context.Site;

            if (httpContext == null || contextSite == null)
            {
                _horizonContext.SetHeadlessMode(new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Disabled)));
                return;
            }

            var horizonModeArgs = ResolveHorizonModeArgs.Create(httpContext, contextSite);
            _horizonPipelines.ResolveHorizonMode(ref horizonModeArgs);

            HeadlessModeParametersWithHorizonHost result = horizonModeArgs.Result;

            if (result.Parameters.Mode != HeadlessMode.Disabled)
            {
                User contextUser = _sitecoreContextHelper.Context.User;
                if (!_horizonContext.HasHorizonAccess(contextUser))
                {
                    if (result.Parameters.Mode != HeadlessMode.Api)
                    {
                        _horizonRequestHelper.RedirectToLoginPageIfApplicable(httpContext);
                    }
                    else
                    {
                        _horizonContext.SetHeadlessMode(result);
                    }
                    return;
                }

                var modeHandler = _modeHandlerResolver.ResolveHandler(result.Parameters.Mode);
                if (modeHandler != null)
                {
                    result = new HeadlessModeParametersWithHorizonHost(modeHandler.HandleHeadlessMode(result.Parameters, httpContext), result.HorizonHost);
                }
                else
                {
                    result = new HeadlessModeParametersWithHorizonHost(HeadlessModeParametersBuilder.Persistent(HeadlessMode.Disabled));
                }
            }

            if (result.Parameters.ResetDisplayMode)
            {
                _sitecoreContextHelper.ResetDisplayModeForRequest(contextSite);
            }

            _horizonContext.SetHeadlessMode(result);
        }
    }
}
