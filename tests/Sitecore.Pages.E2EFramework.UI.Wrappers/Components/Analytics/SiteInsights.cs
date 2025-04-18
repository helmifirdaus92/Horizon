// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text.RegularExpressions;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class SiteInsights : BaseControl
{
    public SiteInsights(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public DropList TimeFilterDropList => new(Container.FindElement("#timeFilter"));

    public DropList DataTypeDropList => new(Container.FindElement("#hrzSaDataTypeDroplist"));
    public DropList ChartTypeDropList => new(Container.FindElement("#hrzSaChartTypeDroplist"));

    public LineChart LineChart => new(Container.FindElement("ngx-charts-line-chart"));
    public IWebElement LineChartInfo => Container.FindElement("app-analytics-timeseries .mdi.mdi-information-outline");

    public List<IWebElement> VerticalBarCharts => Container.FindElements("ngx-charts-bar-vertical").ToList();

    public ColumnChart ColumnChart => new(VerticalBarCharts[0]);
    public ColumnChart SourceChart => new(Container.FindElement("#hrzSourceGraph"));
    public IWebElement SourceInfo => Container.FindElement("app-analytics-source .mdi.mdi-information-outline");

    public IWebElement OverlayInfo => Container.GetDriver().FindElement(".cdk-overlay-container span");

    public HeatMapChart HeatMapChart => new(Container.FindElement("#hrzSaHeatMapGraph"));
    public IWebElement HeatMapInfo => Container.FindElement("app-analytics-heatmap .mdi.mdi-information-outline");

    public HorizontalBarChart TopPagesChart => new(Container.FindElement("#hrzTopPagesGraph"));
    public IWebElement TopPagesInfo => Container.FindElement("app-analytics-top-pages .mdi.mdi-information-outline");

    public HorizontalBarChart TopCountriesChart => new(Container.FindElement("#hrzTopCountriesGraph"));
    public IWebElement TopCountriesInfo => Container.FindElement("app-analytics-top-countries .mdi.mdi-information-outline");

    public FirstPageChart FirstPageChart => new(Container.FindElement("#hrzSaFirstPageTableGraph"));
    public IWebElement FirstPageInfo => Container.FindElement("app-analytics-table .mdi.mdi-information-outline ");

    public HorizontalBarChart BrowserChart => new(Container.FindElement("#hrzBrowserGraph"));
    public IWebElement BrowserInfo => Container.FindElement("app-analytics-browser .mdi.mdi-information-outline");

    public HorizontalBarChart OperatingSystemChart => new(Container.FindElement("#hrzOperatingSystemGraph"));
    public IWebElement OperatingSystemInfo => Container.FindElement("app-analytics-operating-systems .mdi.mdi-information-outline");

    private List<IWebElement> SingleStatCards => Container.FindElements("app-single-stat-tiles ng-spd-card").ToList();

    public string GetSingleCardValue(SiteInsightsSingleStatCards siteInsightsSingleStatCards)
    {
        return SingleStatCards[(int)siteInsightsSingleStatCards].FindElement("div.content h3").Text;
    }

    public string? GetTrendingDirection(SiteInsightsSingleStatCards siteInsightsSingleStatCards)
    {
        string? trendResult = null;
        IWebElement trendingElement = SingleStatCards[(int)siteInsightsSingleStatCards].FindElement("div.content span");

        if (trendingElement.GetClass().Contains("mdi-trending-down"))
        {
            trendResult = "down";
        }

        if (trendingElement.GetClass().Contains("mdi-trending-up"))
        {
            trendResult = "up";
        }

        return trendResult;
    }

    public string GetTrendingValue(SiteInsightsSingleStatCards siteInsightsSingleStatCards)
    {
        string trendingValue = SingleStatCards[(int)siteInsightsSingleStatCards].FindElement("div.content span:not([class*='mdi-trending'])").Text;
        string onlyNumbers = Regex.Replace(trendingValue, @"[^\d]", "");

        return onlyNumbers;
    }

    public void HoverOverSingleCardInfo(SiteInsightsSingleStatCards siteInsightsSingleStatCards)
    {
        SingleStatCards[(int)siteInsightsSingleStatCards].FindElement(".mdi.mdi-information-outline");
        SingleStatCards[(int)siteInsightsSingleStatCards].FindElement(".mdi.mdi-information-outline").Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public string GetOverlayInfoMessage()
    {
        OverlayInfo.WaitForCondition(c => c.Text.Length > 0);
        return OverlayInfo.Text;
    }

    public string GetInfoMessageTextForSingleStatCard(SiteInsightsSingleStatCards siteInsightsSingleStatCards)
    {
        Container.GetDriver().WaitForHorizonIsStable();
        return SingleStatCards[(int)siteInsightsSingleStatCards].FindElement(".mdi.mdi-information-outline").GetAttribute("aria-label");
    }

    public void ClickOnChartElementAndWaitInfoMsgToDisappear(IChart chart)
    {
        chart.Click();
        Container.GetDriver().WaitForCondition(m => !m.CheckElementExists(".cdk-overlay-container span"));
    }

    public void HoverOverInfo(IWebElement info)
    {
        info.Hover();
        Container.GetDriver().WaitForCondition(m => m.CheckElementExists(".cdk-overlay-container span"));
    }

    public string GetInfoMessageFromHtml(IWebElement info)
    {
        info.WaitForCondition(c => c.Enabled);
        return info.GetAttribute("aria-label");
    }
}

public enum SiteInsightsSingleStatCards
{
    Visitors = 0,
    AvgTime = 1,
    Visits = 2,
    BounceRate = 3
}
