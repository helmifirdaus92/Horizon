// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class LineChart : BaseControl, IChart
{
    public LineChart(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    private List<IWebElement> XAxisLines => Container.FindElement("[ngx-charts-x-axis-ticks]").FindElements("line").ToList();
    private List<IWebElement> PointsOnAxis => Container.FindElements("[ngx-charts-circle-series]").ToList();

    public int XAxisCount => XAxisLines.Count;

    public void HoverOverAxisTickLine(int index)
    {
        IWebElement xAxisLine = XAxisLines[index];
        xAxisLine.Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void HoverOverPoint(int index)
    {
        if (PointsOnAxis.Count <= 1)//this is a work around as hover fails at last point in a chart with one line
        {
            return;
        }

        IWebElement pointOnAxis = PointsOnAxis[index];
        pointOnAxis.Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    public void Click()
    {
        Container.Click();
    }
}
