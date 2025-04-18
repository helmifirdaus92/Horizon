// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class LineChartTests : BaseFixture
{
    [TearDown]
    public void RemoveDataFromLocalStorage()
    {
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}');");
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Oslo"]}');");
    }

    [Test]
    public void LineCharts_SortDataPointsInASuperSetOfVariantsData()
    {
        // Mock data
        TimeSeries firstSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>
                {
                    new("2023-01-31 00:00:00+00", 9),
                    new("2023-02-06 00:00:00+00", 10),
                    new("2023-02-03 00:00:00+00", 5),
                    new("2023-01-04 00:00:00+00", 15)
                }
            }
        };

        TimeSeries secondSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>
                {
                    new("2023-01-30 00:00:00+00", 4),
                    new("2023-01-31 00:00:00+00", 02),
                    new("2023-02-04 00:00:00+00", 0),
                    new("2023-02-03 00:00:00+00", 1),
                    new("2023-02-31 00:00:00+00", 15)
                }
            }
        };

        MockTestData(firstSeries, secondSeries);

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select variants
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Check tooltips
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(1);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 4");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 15");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(2);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 2");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(2);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 9");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 5");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 1");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(4);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 0");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(4);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 0");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(5);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 10");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(6);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 15");
    }

    [Test]
    public void LineChart_FirstVariantDoesNotHaveData_OnlySecondPlotShown()
    {
        // Mock Data
        TimeSeries firstSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>()
            }
        };

        TimeSeries secondSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>
                {
                    new("2023-01-30 00:00:00+00", 4),
                    new("2023-01-31 00:00:00+00", 02),
                    new("2023-02-04 00:00:00+00", 0),
                    new("2023-02-03 00:00:00+00", 1),
                    new("2023-02-31 00:00:00+00", 15)
                }
            }
        };

        MockTestData(firstSeries, secondSeries);

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select variants
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Check tooltips
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(0);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 4");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(1);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 2");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(2);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 1");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 0");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(4);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 15");

        CheckLineChartNotShowed("Visitor from Copenhagen");
    }

    [Test]
    public void LineChart_SecondVariantDoesNotHaveData_OnlyFirstPlotShown()
    {
        // Mock Data
        TimeSeries firstSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>
                {
                    new("2023-01-31 00:00:00+00", 9),
                    new("2023-02-06 00:00:00+00", 10),
                    new("2023-02-03 00:00:00+00", 5),
                    new("2023-01-04 00:00:00+00", 15)
                }
            }
        };

        TimeSeries secondSeries = new()
        {
            data = new TimeSeries.Data
            {
                current = new List<TimeSeries.Current>()
            }
        };

        MockTestData(firstSeries, secondSeries);

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select variants
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        // Check tooltips
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(0);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 15");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(1);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 9");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(2);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 5");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 10");

        CheckLineChartNotShowed("Visitor from Oslo");
    }

    private void MockTestData(TimeSeries firstSeries, TimeSeries secondSeries)
    {
        AnalyticsData data = new()
        {
            pageVariantViewTimeseries = firstSeries
        };
        string serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}', JSON.stringify({serializedData}));");

        data.pageVariantViewTimeseries = secondSeries;
        serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Oslo"]}', JSON.stringify({serializedData}));");
    }

    private void CheckLineChartNotShowed(string chart)
    {
        LineChart lineChart = Context.Pages.Analytics.PageInsights.LineChart;
        using (new AssertionScope())
        {
            for (int i = 0; i < lineChart.XAxisCount; i++)
            {
                lineChart.HoverOverAxisTickLine(i);
                Context.Pages.Analytics.ToolTip.Text.Should().NotContain(chart);
            }
        }
    }
}
