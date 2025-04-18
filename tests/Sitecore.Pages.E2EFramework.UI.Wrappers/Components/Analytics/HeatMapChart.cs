// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class HeatMapChart : BaseControl, IChart
{
    public HeatMapChart(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    public int TotalColumns => Container.FindElement("[ngx-charts-x-axis-ticks]").FindElements(".tick").Count;

    public int TotalRows => Container.FindElement("[ngx-charts-y-axis-ticks]").FindElements(".tick").Count;

    private IWebElement ChartCellSeries => Container.FindElement("[ngx-charts-heat-map-cell-series]");

    private List<IWebElement> ChartCells => ChartCellSeries.FindElements("[ngx-charts-heat-map-cell]").ToList();

    public void Click()
    {
        Container.Click();
    }

    public void HoverOverCell(int column, int row)
    {
        int indexOfCell = (column - 1) * TotalRows + row - 1; //count starts from the bottom
        ChartCells[indexOfCell].Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }
}
