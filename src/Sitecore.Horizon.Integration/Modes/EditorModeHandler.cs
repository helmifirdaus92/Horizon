// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Sites;
using Sitecore.Sites.Headless;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Modes
{
    [UsedInConfiguration]
    internal class EditorModeHandler : IHorizonModeHandler
    {
        private readonly ISitecoreContextHelper _sitecoreContextHelper;

        public EditorModeHandler(ISitecoreContextHelper sitecoreContextHelper)
        {
            Assert.ArgumentNotNull(sitecoreContextHelper, nameof(sitecoreContextHelper));

            _sitecoreContextHelper = sitecoreContextHelper;
        }

        public bool CanHandle(HeadlessMode mode) => mode == HeadlessMode.Edit;

        public HeadlessModeParameters HandleHeadlessMode(HeadlessModeParameters parameters, HttpContextBase httpContext)
        {
            Assert.ArgumentNotNull(parameters, nameof(parameters));
            Assert.ArgumentNotNull(httpContext, nameof(httpContext));

            if (IsEditingDisabled(httpContext))
            {
                return HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode();
            }

            SiteContext contextSite = _sitecoreContextHelper.Context.Site ?? throw new InvalidOperationException("SiteContext is null");
            Assert.IsNotNull(contextSite, nameof(contextSite));

            // Temporary switch to Preview when metadata mode is enabled.
            // Remove this code when direct embedding of Rendering host is consumed
            var editModeParam = WebUtil.GetQueryString("sc_editMode");
            if (bool.TryParse(editModeParam, out var editMode) && editMode)
            {
                if (_sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Preview))
                {
                    return parameters;
                }

                return HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode();
            }

            if (!contextSite.EnableWebEdit || !_sitecoreContextHelper.TryEnableDisplayMode(contextSite, DisplayMode.Edit))
            {
                return HeadlessModeParametersBuilder.FallbackForDisabledDisplayMode();
            }

            return parameters;
        }

        private static bool IsEditingDisabled(HttpContextBase httpContext)
        {
            string webEdit = WebUtil.GetQueryString("sc_webedit", null, httpContext);

            return webEdit == "0";
        }
    }
}
