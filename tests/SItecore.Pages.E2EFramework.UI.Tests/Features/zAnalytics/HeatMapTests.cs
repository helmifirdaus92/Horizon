// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class HeatMapTests : BaseFixture
{
    [TearDown]
    public void RemoveDataFromLocalStorage()
    {
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}');");
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Oslo"]}');");
    }

    [Test]
    public void HeatMapsShowsExactRowsAndColumnsReceivedInApi()
    {
        // Mock data
        AnalyticsData data = new();
        HeatMap dataPoints = new();

        dataPoints.data.current.Find(c => c.name.Equals("12:00")).series.Find(s => s.name.Equals("Tue")).value = "200";
        dataPoints.data.current.Find(c => c.name.Equals("13:00")).series.Find(s => s.name.Equals("Wed")).value = "300";
        data.pageVariantHeatmap = dataPoints;
        var serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}', JSON.stringify({serializedData}));");

        dataPoints.data.current.Find(c => c.name.Equals("12:00")).series.Find(s => s.name.Equals("Tue")).value = "200";
        dataPoints.data.current.Find(c => c.name.Equals("12:00")).series.Find(s => s.name.Equals("Wed")).value = "212";
        dataPoints.data.current.Find(c => c.name.Equals("13:00")).series.Find(s => s.name.Equals("Wed")).value = "300";
        data.pageVariantHeatmap = dataPoints;
        serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Oslo"]}', JSON.stringify({serializedData}));");

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select variants
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Check heat map
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(1).HoverOverCell(1, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Tue 12:00: 200");

        Context.Pages.Analytics.PageInsights.GetHeatMapChart(1).HoverOverCell(2, 0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Wed 13:00: 300");
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(1).TotalRows.Should().Be(2);
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(2).TotalRows.Should().Be(2);
    }

    [Test]
    public void VariantDoesNotHaveData_EmptyChartDisplayed()
    {
        // Mock data
        AnalyticsData data = new();
        HeatMap dataPoints = new();

        data.pageVariantHeatmap = dataPoints;
        var serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}', JSON.stringify({serializedData}));");
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Oslo"]}', JSON.stringify({serializedData}));");

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select variants
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Check heat map
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(1).TotalRows.Should().Be(0);
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(2).TotalRows.Should().Be(0);
    }
}
