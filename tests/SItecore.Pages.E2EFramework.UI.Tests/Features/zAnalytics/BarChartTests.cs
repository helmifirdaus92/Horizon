// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Reflection;
using FluentAssertions;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class BarChartTests : BaseFixture
{
    [TearDown]
    public void RemoveDataFromLocalStorage()
    {
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}');");
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Oslo"]}');");
    }

    [TestCase("pageVariantByOperatingSystemHist", "operating system")]
    [TestCase("pageVariantByCountryHist", "top countries")]
    [TestCase("pageVariantByDeviceHist", "browser")]
    public void BarChartsGroupDataForValuesInVariants(string dataKey, string chartName)
    {
        // Mock data
        AnalyticsData data = new();
        Histogram firstPoints = new();
        firstPoints.data.current.Add(new Histogram.Current("ValueA", 10));
        PropertyInfo property = data.GetType().GetProperty(dataKey);
        property.SetValue(data, firstPoints);
        string serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}', JSON.stringify({serializedData}));");

        Histogram secondPoints = new();
        secondPoints.data.current.Add(new Histogram.Current("ValueB", 20));
        property = data.GetType().GetProperty(dataKey);
        property.SetValue(data, secondPoints);
        serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Oslo"]}', JSON.stringify({serializedData}));");

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Checking tooltips
        HoverOverGraph(chartName, 1, 1);
        var tooltipText = Context.Pages.Analytics.ToolTip.Text;
        Logger.Write($"Tooltip text: {tooltipText}");
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen, ValueA: 10");

        HoverOverGraph(chartName, 2, 2);
        tooltipText = Context.Pages.Analytics.ToolTip.Text;
        Logger.Write($"Tooltip text: {tooltipText}");
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo, ValueB: 20");

        // Hover fails when bar plots zero so checking in html element's attributes
        HoverOverGraph(chartName, 1, 2);
        CheckValuePlottedBarInChartSeries(chartName, "ValueA Visitor from Oslo, 0", 1, 2);
        CheckValuePlottedBarInChartSeries(chartName, "ValueB Visitor from Copenhagen, 0", 2, 1);
    }

    private void HoverOverGraph(string chartName, int barIndex, int variant)
    {
        switch (chartName)
        {
            case "top variants":
                Context.Pages.Analytics.PageInsights.TopVariantsChart.HoverOverBarInChartSeries(barIndex, variant);
                break;
            case "top countries":
                Context.Pages.Analytics.PageInsights.TopCountriesChartGrouped.HoverOverBarInChartSeries(barIndex, variant);
                break;
            case "browser":
                Context.Pages.Analytics.PageInsights.BrowserChartGrouped.HoverOverBarInChartSeries(barIndex, variant);
                break;
            case "operating system":
                Context.Pages.Analytics.PageInsights.OperatingSystemChartGrouped.HoverOverBarInChartSeries(barIndex, variant);
                break;
        }
    }

    private void CheckValuePlottedBarInChartSeries(string chartName, string value, int barIndex, int variant)
    {
        string actualValue = chartName switch
        {
            "top variants" => Context.Pages.Analytics.PageInsights.TopVariantsChart.ValuePlottedBarInChartSeries(barIndex, variant),
            "top countries" => Context.Pages.Analytics.PageInsights.TopCountriesChartGrouped.ValuePlottedBarInChartSeries(barIndex, variant),
            "browser" => Context.Pages.Analytics.PageInsights.BrowserChartGrouped.ValuePlottedBarInChartSeries(barIndex, variant),
            "operating system" => Context.Pages.Analytics.PageInsights.OperatingSystemChartGrouped.ValuePlottedBarInChartSeries(barIndex, variant),
            _ => null
        };

        actualValue.Should().Be(value);
    }
}
