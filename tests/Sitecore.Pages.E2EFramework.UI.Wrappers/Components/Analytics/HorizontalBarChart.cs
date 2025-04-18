// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class HorizontalBarChart : BaseControl, IChart
{
    public HorizontalBarChart(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    private List<IWebElement> Bars => Container.FindElements("[ngx-charts-series-horizontal] [ngx-charts-bar]").ToList();
    private List<IWebElement> ChartSeries => Container.FindElements("[ngx-charts-series-horizontal]").ToList();

    public void HoverOverBar(int index)
    {
        Bars[index - 1].Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void HoverOverBarInChartSeries(int index, int variant)
    {
        List<IWebElement> chartSeries = ChartSeries[index - 1].FindElements("[ngx-charts-bar]").ToList();
        Thread.Sleep(2000);
        chartSeries[variant - 1].Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    //A work around since hover over a bar with value 0 fails
    public string ValuePlottedBarInChartSeries(int index, int variant)
    {
        List<IWebElement> chartSeries = ChartSeries[index - 1].FindElements("[ngx-charts-bar]").ToList();
        return chartSeries[variant - 1].FindElement("path").GetAttribute("aria-label");
    }

    public void Click()
    {
        Container.Click();
    }
}
