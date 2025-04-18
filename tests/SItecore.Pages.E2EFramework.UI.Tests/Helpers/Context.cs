// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages;
using Site = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types.Site;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Helpers
{
    public static class Context
    {
        public static BrowserWrapper Browser;
        public static ApiHelper ApiHelper;
        public static XMAppsApi XMAppsApi;
        public static LoginPage LoginPage;
        public static Wrappers.Pages.Pages Pages;
        public static Dictionary<string, Item> TestItems = new();
        public static string TestTenant;
        public static string TestTenantId;
        public static string LocalTenant;
        public static string CmUrl;
        public static string EdgeClientId;
        public static string EdgeClientSecret;
        public static Collection SiteCollection;
        public static List<Site> Sites;
        public static string SXAHeadlessSite;
        public static string SharedSite;
        public static string SXAHeadlessTenant;

        public static string XmCloudEnvironmentId;
        public static string XmCloudProjectId;

        public static void Clear(this Dictionary<string, Item> items, bool keepProtected)
        {
            if (keepProtected)
            {
                var keysToRemove = (from kvp in items where !kvp.Value.DoNotDelete select kvp.Key).ToList();

                foreach (var key in keysToRemove)
                {
                    items.Remove(key);
                }
            }
            else
            {
                items.Clear();
            }
        }
    }
}
