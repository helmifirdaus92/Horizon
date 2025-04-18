// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Configuration
{
    public interface ISitecoreConfiguration
    {
        ISitecoreSite AddSite(string name, string startItemPath, string rootPath = "/Sitecore/content", string hostName = null, string targetHostName = null,
            string virtualFolder = "/", string physicalFolder = "/", string database = "web", string language = "en", string domain = "extranet", bool allowDebug = true,
            bool cacheHtml = true, string htmlCacheSize = "50MB", bool enablePreview = true, bool enableWebEdit = true, bool enableDebugger = true, bool disableClientData = false,
            bool enableItemLanguageFallback = false, bool enableFieldLanguageFallback = false, bool patchBeforeWebsite = false);

        ISitecoreSite AddSiteToCombinedPatch(string name, string startItemPath, string rootPath = "/Sitecore/content", string hostName = null, string targetHostName = null,
            string virtualFolder = "/", string physicalFolder = "/", string database = "web", string language = "en", string domain = "extranet", bool allowDebug = true,
            bool cacheHtml = true, string htmlCacheSize = "50MB", bool enablePreview = true, bool enableWebEdit = true, bool enableDebugger = true, bool disableClientData = false,
            bool enableItemLanguageFallback = false, bool enableFieldLanguageFallback = false, bool patchBeforeWebsite = false);

        void WriteCombinedPatch();
        void RestoreConfiguration();
        void ClearSitecoreCache();
        void DisableAntiCsrfTokens();
        void DisableRobotDetection();
        void DisableDeviceDetection();
        void DisableHorizonAnalyticsCache();
        void DisableXdb();
        void WarmUpInstance();
    }
}
