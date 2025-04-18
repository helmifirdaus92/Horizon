// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Configuration;
using System.Diagnostics;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI
{
    public static class Settings
    {
        public static string HorizonAppPath = ConfigurationManager.AppSettings["HorizonAppPath"];
        public static BrowserName DefaultBrowser = BrowserName.Chrome;

        public static BrowserName BrowserName
        {
            get
            {
                switch (ConfigurationManager.AppSettings["Browser"].ToLower())
                {
                    case "internetexplorer":
                        return BrowserName.InternetExplorer;
                    case "firefox":
                        return BrowserName.Firefox;
                    case "edge":
                        return BrowserName.Edge;
                    case "phantom":
                        return BrowserName.Phantom;
                    case "server":
                        return BrowserName.Server;
                    default:
                        return BrowserName.Chrome;
                }
            }
        }

        public static string ScreenshotFolder => ConfigurationManager.AppSettings["ScreenshotFolder"];
        public static bool MakeScreenshotOnFailure => bool.Parse(ConfigurationManager.AppSettings["MakeScreenshotOnFailure"]);
        public static bool UseHeadlessMode => !IsLocalRun; //run in headless mode for service session;
        public static bool IsLocalRun => Process.GetCurrentProcess().SessionId != 0;
        public static int BrowserWidth => int.Parse(ConfigurationManager.AppSettings["BrowserWidth"]);
        public static int BrowserHeight => int.Parse(ConfigurationManager.AppSettings["BrowserHeight"]);
        public static string EdgeQraphQlApiUrl => ConfigurationManager.AppSettings["ExpEdgeAPIBaseUrl"];
        public static string EdgeQraphQlApiKey => ConfigurationManager.AppSettings["ExpEdgeQraphQlApiKey"];
        public static string XMAppsUrl => ConfigurationManager.AppSettings["XMAppsUrl"];
        public static string OrganizationId => ConfigurationManager.AppSettings["OrganizationId"];
        public static string AuthClientId => ConfigurationManager.AppSettings["AuthClientId"];
        public static string AuthAudience => ConfigurationManager.AppSettings["AuthAudience"];

        public static class Instances
        {
            public static string HorizonClient = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["Horizon"];
            public static string AdditionalSiteHost = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["AdditionalSiteHost"];
            public static string Cm = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["CM"];
        }

        public static class HorizonUser
        {
            public const string UserName = "sitecore\\HorizonUser";

            public const string Password = "b";
        }

        public static class AdminUser
        {
            public static string UserName = ConfigurationManager.AppSettings["AdminUser"];

            public static string Password = ConfigurationManager.AppSettings["AdminPassword"];

            public static string FullName = ConfigurationManager.AppSettings["AdminUserFullName"];
        }

        public static class AuthorUser
        {
            public const string UserName = "user@pagestest.com";

            public const string Password = "Qp9/Uk7*Ng7/Fs5+Tt0(";

            public static string FullName = "XMC User Pages";
        }
        public static class CustomUser
        {
            public const string UserName = "user3@pagestest.com";

            public const string Password = "Password123!";

            public static string FullName = "XMC User1 Pages";
        }

        public static class DefaultScData
        {
            public const string HomeItemId = "110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9";
        }
    }
}
