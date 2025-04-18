// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Text.RegularExpressions;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class PageInsights : BaseControl
{
    public PageInsights(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public enum PageInsightsSingleStatCards
    {
        Visitors = 0,
        AvgPageViewsPerSession = 1,
        Views = 2,
        VisitorsVar2 = 3,
        AvgPageViewsPerSessionVar2 = 4,
        ViewsVar2 = 5
    }

    public DropList TimeFilterDropList => new(Container.FindElement("#timeFilter"));
    public DropList FirstVariantDropList => new(Container.FindElement("#hrzPaFirstVariantDroplist"));
    public SecondVariantDropList SecondVariantDropList => new(Container.FindElement(".secondVariant"), Container.FindElement("#hrzPaSecondVariantDroplist"));
    public bool TimeFilterEnabled => TimeFilterDropList.Container.Enabled;
    public LeftHandPanel.LeftHandPanel LeftHandPanel => new(Container.GetDriver().FindElement("app-left-hand-side"));

    private List<IWebElement> HeatMapChartsElements => Container.FindElements("#hrzSaHeatMapGraph").ToList();
    public IWebElement HeatMapInfo => Container.FindElement("app-analytics-heatmap .mdi.mdi-information-outline");

    public LineChart LineChart => new(Container.FindElement("ngx-charts-line-chart"));
    public IWebElement LineChartInfo => Container.FindElement("app-analytics-timeseries .mdi.mdi-information-outline");

    public ColumnChart SourceChart => new(Container.FindElement("#hrzSourceGraph"));
    public IWebElement SourceInfo => Container.FindElement("app-analytics-source .mdi.mdi-information-outline");

    public HorizontalBarChart TopVariantsChart => new(Container.FindElement("#hrzTopPagesGraph"));
    public IWebElement TopPagesInfo => Container.FindElement("app-analytics-top-pages .mdi.mdi-information-outline");

    public HorizontalBarChart TopCountriesChartGrouped => new(Container.FindElement("#hrzTopCountriesGraphGrouped"));
    public IWebElement TopCountriesInfo => Container.FindElement("app-analytics-top-countries .mdi.mdi-information-outline");

    public HorizontalBarChart BrowserChartGrouped => new(Container.FindElement("#hrzBrowserGraphGrouped"));
    public IWebElement BrowserInfo => Container.FindElement("app-analytics-browser .mdi.mdi-information-outline");

    public HorizontalBarChart OperatingSystemChartGrouped => new(Container.FindElement("#hrzOperatingSystemGraphGrouped"));
    public IWebElement OperatingSystemInfo => Container.FindElement("app-analytics-operating-systems .mdi.mdi-information-outline");

    private List<IWebElement> SingleStatCards => Container.FindElements("app-single-stat-page-analytics ng-spd-card").ToList();
    public DropList ChartTypeDropList => new(Container.FindElement("#hrzSaChartTypeDroplist"));
    public ColumnChart ColumnChartGrouped => new(Container.FindElement("#hrzTimeSeriesBarGraphGrouped"));
    public ColumnChart SourceChartGrouped => new(Container.FindElement("#hrzSourceGraphGrouped"));

    public IWebElement OverlayInfo => Container.GetDriver().FindElement(".cdk-overlay-container");

    public string OverlayInfoText
    {
        get
        {
            if (OverlayInfo.Text.Length > 0)
            {
                return OverlayInfo.Text;
            }

            Container.GetDriver().WaitForCondition(d => Container.GetDriver().FindElement(".cdk-overlay-container").Text.Length > 0);
            return OverlayInfo.Text;
        }
    }

    private List<IWebElement> VariantsDropLists => Container.FindElements(".variants-filter ng-spd-droplist:not(.hidden)").ToList();
    public int DropListsInView => VariantsDropLists.Count;

    public HeatMapChart GetHeatMapChart(int variant)
    {
        List<HeatMapChart> heatMapCharts = HeatMapChartsElements.Select(element => new HeatMapChart(element)).ToList();
        return heatMapCharts[variant - 1];
    }

    public string GetSingleCardValue(PageInsightsSingleStatCards card)
    {
        return SingleStatCards[(int)card].FindElement("div.content h3").Text;
    }

    public string GetTrendingDirection(PageInsightsSingleStatCards card)
    {
        string? trendResult = null;
        IWebElement? trendingElement = SingleStatCards[(int)card].FindElement("div.content span");

        if (trendingElement.GetClass().Contains("mdi-trending-down"))
        {
            trendResult = "down";
        }

        if (trendingElement.GetClass().Contains("mdi-trending-up"))
        {
            trendResult = "up";
        }

        if (trendingElement.GetClass().Contains("mdi-trending-neutral"))
        {
            trendResult = "neutral";
        }

        return trendResult!;
    }

    public string GetTrendingValue(PageInsightsSingleStatCards card)
    {
        string trendingValue = SingleStatCards[(int)card].FindElement("div.content span:not([class*='mdi-trending'])").Text;

        Regex regex = new(@"\d+(\.\d+)?");
        Match match = regex.Match(trendingValue);

        return match.Value;
    }

    public void HoverOverInfo(IWebElement info)
    {
        info.Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public string GetInfoMessageFromHtml(IWebElement info)
    {
        info.WaitForCondition(c => c.Enabled);
        return info.GetAttribute("aria-label");
    }

    public void HoverOverSingleCardInfo(PageInsightsSingleStatCards card)
    {
        SingleStatCards[(int)card].FindElement(".mdi.mdi-information-outline").Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public string GetInfoMessageTextForSingleStatCard(PageInsightsSingleStatCards card)
    {
        Container.GetDriver().WaitForHorizonIsStable();
        return SingleStatCards[(int)card].FindElement(".mdi.mdi-information-outline").GetAttribute("aria-label");
    }

    public void CLickOnChartElementAndWaitInfoMsgToDisappear(IChart chart)
    {
        chart.Click();
        Container.GetDriver().WaitForCondition(m => !m.CheckElementExists(".cdk-overlay-container span"));
    }
}
