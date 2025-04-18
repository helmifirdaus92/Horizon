// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Sites;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Modes
{
    [UsedInConfiguration]
    internal class PreviewModeHandler : IHorizonModeHandler
    {
        private readonly ISitecoreContextHelper _sitecoreContextHelper;

        public PreviewModeHandler(
            ISitecoreContextHelper sitecoreContextHelper)
        {
            Assert.ArgumentNotNull(sitecoreContextHelper, nameof(sitecoreContextHelper));

            _sitecoreContextHelper = sitecoreContextHelper;
        }

        public bool CanHandle(HeadlessMode mode) => mode == HeadlessMode.Preview;

        public HeadlessModeParameters HandleHeadlessMode(HeadlessModeParameters parameters, HttpContextBase httpContext)
        {
            Assert.ArgumentNotNull(parameters, nameof(parameters));
            Assert.ArgumentNotNull(httpContext, nameof(httpContext));

            SiteContext contextSite = _sitecoreContextHelper.Context.Site ?? throw new InvalidOperationException("SiteContext is null");
            Assert.IsNotNull(contextSite, nameof(contextSite));

            if (!contextSite.EnablePreview || !_sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Preview))
            {
                return HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode();
            }

            _sitecoreContextHelper.EnablePreviewForUnpublishableItems(contextSite);
            return parameters;
        }
    }
}
