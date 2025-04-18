// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Configuration;
using System.Diagnostics;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;

namespace Sitecore.Horizon.ContentHub.Dam.Plugin.Tests.UI
{
    class Settings
    {
        public static string HorizonAppPath = ConfigurationManager.AppSettings["HorizonAppPath"];

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
        public static bool UseHeadlessMode => Process.GetCurrentProcess().SessionId == 0; //run in headless mode for service session;
        public static int BrowserWidth => int.Parse(ConfigurationManager.AppSettings["BrowserWidth"]);
        public static int BrowserHeight => int.Parse(ConfigurationManager.AppSettings["BrowserHeight"]);

        public static class Instances
        {
            public static string HorizonClient = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["Horizon"];
            public static string Cm = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["CM"];
            public static string ContentHub = ((NameValueCollection)ConfigurationManager.GetSection("instances"))["ContentHub"];
        }

        public static class AdminUser
        {
            public const string UserName = "sitecore\\admin";

            public const string Password = "b";
        }

        public static class AuthorUser
        {
            public const string UserName = "sitecore\\HorizonAuthorUser";

            public const string Password = "b";
        }

        public static class ContentHubUser
        {
            public const string UserName = "HorizonQAUser";

            public const string Password = "1FancyPantsyPasswordForCIUser!";
        }

        public static class DefaultScData
        {
            public const string HomeItemId = "110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9";
        }
    }
}
