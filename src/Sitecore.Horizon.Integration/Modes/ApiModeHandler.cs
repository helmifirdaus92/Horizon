// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Modes
{
    [UsedInConfiguration]
    internal class ApiModeHandler : IHorizonModeHandler
    {
        private readonly ISitecoreContextHelper _sitecoreContextHelper;

        public ApiModeHandler(ISitecoreContextHelper sitecoreContextHelper)
        {
            Assert.ArgumentNotNull(sitecoreContextHelper, nameof(sitecoreContextHelper));

            _sitecoreContextHelper = sitecoreContextHelper;
        }

        public bool CanHandle(HeadlessMode mode) => mode == HeadlessMode.Api;

        public HeadlessModeParameters HandleHeadlessMode(HeadlessModeParameters parameters, HttpContextBase httpContext)
        {
            Assert.ArgumentNotNull(parameters, nameof(parameters));

            if (_sitecoreContextHelper.Context.Site == null)
            {
                throw new InvalidOperationException("SiteContext is null");
            }

            HeadlessModeParameters result = HeadlessModeParametersBuilder.ForRequest(HeadlessMode.Api);

            return result;
        }
    }
}
