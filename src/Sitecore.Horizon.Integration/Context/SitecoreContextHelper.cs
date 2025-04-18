// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Threading;
using System.Web;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Security.Accounts;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.Context
{
    internal class SitecoreContextHelper : ISitecoreContextHelper
    {
        private readonly ISitecoreContext _sitecoreContext;

        private readonly BaseAuthenticationManager _authenticationManager;

        public SitecoreContextHelper(ISitecoreContext sitecoreContext, BaseAuthenticationManager authenticationManager)
        {
            Assert.ArgumentNotNull(sitecoreContext, nameof(sitecoreContext));
            Assert.ArgumentNotNull(authenticationManager, nameof(authenticationManager));

            _sitecoreContext = sitecoreContext;
            _authenticationManager = authenticationManager;
        }

        public ISitecoreContext Context => _sitecoreContext;

        public bool TryEnableDisplayMode(SiteContext site, DisplayMode displayMode)
        {
            Assert.ArgumentNotNull(site, nameof(site));

            if (site.DisplayMode == displayMode)
            {
                return true;
            }

            _sitecoreContext.SetDisplayMode(site, displayMode, DisplayModeDuration.Remember);

            // When resolving context user Sitecore might rely on the context site domain. When we switch display mode, the domain might change,
            // leading to other user being resolved. The issue is that Sitecore caches the resolved user, so if somebody already accessed the context user, value will be never updated.
            // To fix that we clear the cached user, and then set new active user.
            // Actually, this fix should reside inside the platform, but we now are at the phase when changes to platform are not allowed, so we put it here.
            User user = _sitecoreContext.User;
            if (!IsCorrectUserDomain(user, site))
            {
                ResetActiveUser();
            }

            return site.DisplayMode == displayMode;
        }

        public void ResetDisplayModeForRequest(SiteContext site)
        {
            Assert.ArgumentNotNull(site, nameof(site));

            if (site.DisplayMode != DisplayMode.Normal)
            {
                _sitecoreContext.SetDisplayMode(site, DisplayMode.Normal, DisplayModeDuration.Temporary);
            }
        }

        public void EnablePreviewForUnpublishableItems(SiteContext site)
        {
            Assert.ArgumentNotNull(site, nameof(site));

            if (site.DisplayMode == DisplayMode.Preview)
            {
                _sitecoreContext.EnablePreviewForUnpublishableItems(site);
            }
        }

        private static bool IsCorrectUserDomain(User user, SiteContext contextSite)
        {
            if (user.IsAuthenticated)
            {
                return true;
            }

            return user.Domain == contextSite.Domain;
        }

        private void ResetActiveUser()
        {
            HttpContextBase? httpContext = _sitecoreContext.HttpContext;
            if (httpContext != null)
            {
                httpContext.User = null;
            }

            Thread.CurrentPrincipal = null;

            User reinitializedUser = _sitecoreContext.User;

            // We should explicitly call 'SetActiveUser' method because Sitecore platform doesn't reset active user in scope of the 'Context.User' property
            // in case if current user is not authenticated.
            _authenticationManager.SetActiveUser(reinitializedUser);
        }
    }
}
