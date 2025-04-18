// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers
{
    public class UiManager
    {
        public static Horizon Init(BrowserName browserName, string sitecoreUrl, string horizonUrl, string horizonBasePath, bool useHeadlessMode = false, int? windowWidth = null, int? windowHeight = null, string userAgent = null, string proxy = null)
        {
            var horizonAppFullPath = new Uri(new Uri(horizonUrl), horizonBasePath).ToString().TrimEnd('/');
            var browser = InitBrowser(browserName, useHeadlessMode, windowWidth, windowHeight, userAgent, proxy);
            return new Horizon(browser, sitecoreUrl, horizonAppFullPath);
        }

        public static BrowserWrapper InitBrowser(BrowserName browserName, bool useHeadlessMode = false, int? windowWidth = null, int? windowHeight = null, string userAgent = null, string proxy = null)
        {
            var browserType = (BrowserType)Enum.Parse(typeof(BrowserType), browserName.ToString());
            var arguments = new List<string>();
            if (useHeadlessMode)
            {
                arguments.Add("--headless");
            }

            if (windowHeight != null && windowWidth != null)
            {
                arguments.Add($"--window-size={windowWidth},{windowHeight}");
            }

            if (userAgent != null)
            {
                arguments.Add($"--user-agent={userAgent}");
            }

            if (proxy != null)
            {
                arguments.Add($"--proxy-server={proxy}");
            }

            new UtfFixtureBase(browserType).InitializeDriver(arguments, new Dictionary<string, string>());
            var browser = new BrowserWrapper(Context.Driver, Context.Browser);
            return browser;
        }
    }
}
