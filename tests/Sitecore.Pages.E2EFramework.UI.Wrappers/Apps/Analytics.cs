// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps;

public class Analytics : App
{
    public Analytics(BrowserWrapper browser, string clientUrl) : base("analytics", browser, clientUrl)
    {
    }

    public SiteInsights SiteInsights => new(Browser.FindElement("main app-site-analytics"));

    public PageInsights PageInsights => new(Browser.FindElement("main app-page-analytics"));
    public TopBar TopBar => new(Browser.FindElement("app-top-bar"));
    public ChartToolTip ToolTip => new(Browser.FindElement("ngx-tooltip-content"));

    public ItemsTree ContentTree => new(Browser.FindElement("ng-spd-tree"));
    private List<IWebElement> AnalyticsTabs => Browser.FindElements("main ng-spd-tab-group[role='tablist'] button").ToList();

    public void WaitForAnalyticsLoaded()
    {
        Browser.WaitForHorizonIsStable();
    }

    public Analytics Open(string siteName,string? tenantName=null)
    {
        base.Open(site: siteName, tenantName:tenantName);
        WaitForAnalyticsLoaded();
        return this;
    }

    public void OpenSiteInsights()
    {
        AnalyticsTabs.Find(s => s.Text.Contains("Site insights"))?.Click();

        WaitForAnalyticsLoaded();
    }

    public void OpenPageInsights()
    {
        AnalyticsTabs.Find(s => s.Text.Contains("Page insights"))?.Click();

        WaitForAnalyticsLoaded();
    }
}
