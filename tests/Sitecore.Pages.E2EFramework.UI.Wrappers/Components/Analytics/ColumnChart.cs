// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

public class ColumnChart : BaseControl, IChart
{
    public ColumnChart(IWebElement container, params object[] parameters) : base(container, parameters)
    {
    }

    private List<IWebElement> XAxisGroups => Container.FindElement("[ngx-charts-x-axis-ticks]").FindElements(".tick title").ToList();

    private List<IWebElement> BarGroups => Container.FindElements("[ngx-charts-series-vertical]").ToList();

    public List<string> BarsInGroupsIndex(int index)
    {
        return _barsInGroupsIndex(index).Select(bar => bar.Text).ToList();
    }

    public void Click()
    {
        Container.Click();
    }

    public void HoverOverBar(int groupIndex, int barIndex)
    {
        _barsInGroupsIndex(groupIndex)[barIndex].Hover();
        Container.GetDriver().WaitForHorizonIsStable();
    }

    private List<IWebElement> _barsInGroupsIndex(int index)
    {
        return BarGroups[index].FindElements("[ngx-charts-bar]").ToList();
    }
}
