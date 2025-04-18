// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Configuration;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI.Helpers
{
    public static class BrowserHelper
    {
        public static void ChangeBrowser(BrowserName browserName)
        {
            ConfigurationManager.AppSettings["Browser"] = browserName.ToString();
        }

        public static void RestoreBrowserToDefault()
        {
            ChangeBrowser(Settings.DefaultBrowser);
        }
    }
}
