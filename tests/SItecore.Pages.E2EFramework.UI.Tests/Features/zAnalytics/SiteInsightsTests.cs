// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class SiteInsightsTests : BaseFixture
{
    [SetUp]
    public void OpenSiteInsights()
    {
        CommonSteps.OpenSiteInsights();
    }

    [Test]
    public void SiteInsights_HasStatCardsValues()
    {
        Context.Pages.Analytics.SiteInsights.GetSingleCardValue(SiteInsightsSingleStatCards.Visitors).Should().Be("50");
        Context.Pages.Analytics.SiteInsights.GetTrendingDirection(SiteInsightsSingleStatCards.Visitors).Should().Be("down");
        Context.Pages.Analytics.SiteInsights.GetTrendingValue(SiteInsightsSingleStatCards.Visitors).Should().Be("40");

        Context.Pages.Analytics.SiteInsights.GetSingleCardValue(SiteInsightsSingleStatCards.AvgTime).Should().Be("0.1m");
        Context.Pages.Analytics.SiteInsights.GetTrendingDirection(SiteInsightsSingleStatCards.AvgTime).Should().Be("up");
        Context.Pages.Analytics.SiteInsights.GetTrendingValue(SiteInsightsSingleStatCards.AvgTime).Should().Be("0");

        Context.Pages.Analytics.SiteInsights.GetSingleCardValue(SiteInsightsSingleStatCards.Visits).Should().Be("200");
        Context.Pages.Analytics.SiteInsights.GetTrendingDirection(SiteInsightsSingleStatCards.Visits).Should().Be("up");
        Context.Pages.Analytics.SiteInsights.GetTrendingValue(SiteInsightsSingleStatCards.Visits).Should().Be("150");

        Context.Pages.Analytics.SiteInsights.GetSingleCardValue(SiteInsightsSingleStatCards.BounceRate).Should().Be("80%");
        Context.Pages.Analytics.SiteInsights.GetTrendingDirection(SiteInsightsSingleStatCards.BounceRate).Should().Be("up");
        Context.Pages.Analytics.SiteInsights.GetTrendingValue(SiteInsightsSingleStatCards.BounceRate).Should().Be("30");
    }

    [Test]
    public void SiteInsights_ApplyFiltering_LineAndColumnChartsHaveCorrectData()
    {
        CommonSteps.SelectTimeFilter("SiteInsights", "30 days");
        Context.Pages.Analytics.SiteInsights.DataTypeDropList.SelectDropListItem("Visits");
        Context.Pages.Analytics.SiteInsights.ChartTypeDropList.SelectDropListItem("Line chart");
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverAxisTickLine(1);
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverPoint(0);

        Context.Pages.Analytics.ToolTip.Text.Should().Contain("visits: 3677");

        Context.Pages.Analytics.SiteInsights.DataTypeDropList.SelectDropListItem("Visitors");
        Context.Pages.Analytics.SiteInsights.ChartTypeDropList.SelectDropListItem("Line chart");
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverAxisTickLine(5);
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverPoint(0);

        Context.Pages.Analytics.ToolTip.Text.Should().Contain("visitors: 1707");

        CommonSteps.SelectTimeFilter("SiteInsights", "7 days");
        Context.Pages.Analytics.SiteInsights.DataTypeDropList.SelectDropListItem("Visits");
        Context.Pages.Analytics.SiteInsights.ChartTypeDropList.SelectDropListItem("Line chart");
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.SiteInsights.LineChart.HoverOverPoint(0);

        Context.Pages.Analytics.ToolTip.Text.Should().Contain("visits: 5101");
        Context.Pages.Analytics.SiteInsights.DataTypeDropList.SelectDropListItem("Visitors");
        Context.Pages.Analytics.SiteInsights.ChartTypeDropList.SelectDropListItem("Column chart");

        Context.Pages.Analytics.SiteInsights.ColumnChart.BarsInGroupsIndex(0).Count.Should().Be(7);

        Context.Pages.Analytics.SiteInsights.ColumnChart.HoverOverBar(0, 4);
        Context.Pages.Analytics.ToolTip.ToolTipContent.WaitForCondition(t => t.Displayed);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Feb 24: 210");

        Context.Pages.Analytics.SiteInsights.DataTypeDropList.SelectDropListItem("Visits");
        Context.Pages.Analytics.SiteInsights.ChartTypeDropList.SelectDropListItem("Column chart");
        Context.Pages.Analytics.SiteInsights.ColumnChart.HoverOverBar(0, 5);

        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Oct 9: 5101");
    }

    [Test]
    public void SiteInsights_SourceChartHasCorrectData()
    {
        CommonSteps.SelectTimeFilter("SiteInsights", "30 days");
        Context.Pages.Analytics.SiteInsights.SourceChart.BarsInGroupsIndex(0).Count.Should().Be(6);

        Context.Pages.Analytics.SiteInsights.SourceChart.HoverOverBar(0, 3);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Career: 133");
    }

    [Test]
    public void SiteInsights_ChartsInfoHasCorrectData()
    {
        Logger.Write("When user hovers over information on 'visitors' single stat tile for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.LineChart);
        Context.Pages.Analytics.SiteInsights.HoverOverSingleCardInfo(SiteInsightsSingleStatCards.Visitors);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage().Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageTextForSingleStatCard(SiteInsightsSingleStatCards.Visitors));

        Logger.Write("When user hovers over information on 'avg time on site' single stat tile for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.LineChart);
        Context.Pages.Analytics.SiteInsights.HoverOverSingleCardInfo(SiteInsightsSingleStatCards.AvgTime);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage().Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageTextForSingleStatCard(SiteInsightsSingleStatCards.AvgTime));

        Logger.Write("When user hovers over information on 'visitors' single stat tile for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.LineChart);
        Context.Pages.Analytics.SiteInsights.HoverOverSingleCardInfo(SiteInsightsSingleStatCards.Visits);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage().Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageTextForSingleStatCard(SiteInsightsSingleStatCards.Visits));

        Logger.Write("When user hovers over information on 'bounce rate' single stat tile for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.LineChart);
        Context.Pages.Analytics.SiteInsights.HoverOverSingleCardInfo(SiteInsightsSingleStatCards.BounceRate);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage().Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageTextForSingleStatCard(SiteInsightsSingleStatCards.BounceRate));

        Logger.Write("When user hovers over information on line chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.LineChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.LineChartInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.LineChartInfo));

        Logger.Write("When user hovers over information on heatmap chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.HeatMapChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.HeatMapInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.HeatMapInfo));

        Logger.Write("When user hovers over information on Top pages chart for 'site' insights"); 
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.TopPagesChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.TopPagesInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.TopPagesInfo));

        Logger.Write("When user hovers over information on Top countries chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.TopCountriesChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.TopCountriesInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.TopCountriesInfo));

        Logger.Write("When user hovers over information on First page chart");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.FirstPageChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.FirstPageInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.FirstPageInfo));

        Logger.Write("When user hovers over information on Source chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.SourceChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.SourceInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.SourceInfo));

        Logger.Write("When user hovers over information on Browser chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.BrowserChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.BrowserInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.BrowserInfo));

        Logger.Write("When user hovers over information on Operating system chart for 'site' insights");
        Context.Pages.Analytics.SiteInsights.ClickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.SiteInsights.OperatingSystemChart);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.SiteInsights.OperatingSystemInfo);
        Context.Pages.Analytics.SiteInsights.GetOverlayInfoMessage()
            .Should().Be(Context.Pages.Analytics.SiteInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.SiteInsights.OperatingSystemInfo));
    }

    [TestCase("top pages", 2, "About Us: 60")]
    [TestCase("top countries", 3, "Ireland: 185")]
    [TestCase("browser", 4, "Opera: 141")]
    [TestCase("operating system", 2, "Windows 10: 234")]
    public void SiteInsights_HorizontalChartsHaveCorrectData(string chartName, int barIndex, string tooltipValue)
    {
        CommonSteps.SelectTimeFilter("SiteInsights", "30 days");

        switch (chartName)
        {
            case "top pages":
                Context.Pages.Analytics.SiteInsights.TopPagesChart.HoverOverBar(barIndex);
                break;
            case "top countries":
                Context.Pages.Analytics.SiteInsights.TopCountriesChart.HoverOverBar(barIndex);
                break;
            case "browser":
                Context.Pages.Analytics.SiteInsights.BrowserChart.HoverOverBar(barIndex);
                break;
            case "operating system":
                Context.Pages.Analytics.SiteInsights.OperatingSystemChart.HoverOverBar(barIndex);
                break;
        }

        Context.Pages.Analytics.ToolTip.Text.Should().Contain(tooltipValue);
    }

    [Test]
    public void SiteInsights_FirstPageChartHasCorrectData()
    {
        CommonSteps.SelectTimeFilter("SiteInsights", "30 days");
        Context.Pages.Analytics.SiteInsights.FirstPageChart.RowsCount.Should().Be(6);

        List<FirstPageColumns> tableData = Context.Pages.Analytics.SiteInsights.FirstPageChart.GetTableData();
        tableData[0].Name.Should().Be("Home Page");
        tableData[0].PreviousPeriod.Should().Be("220");
        tableData[0].RecentPeriod.Should().Be("2420");
        tableData[0].Trend.Should().Be("+2200");

        tableData[2].Name.Should().Be("News");
        tableData[2].PreviousPeriod.Should().Be("122");
        tableData[2].RecentPeriod.Should().Be("200");
        tableData[2].Trend.Should().Be("+78");

        tableData[5].Name.Should().Be("Privacy Policy");
        tableData[5].PreviousPeriod.Should().Be("3");
        tableData[5].RecentPeriod.Should().Be("3");
        tableData[5].Trend.Should().Be("0");
    }

    [Test]
    public void SiteInsights_HeatMapChartHasCorrectData()
    {
        Context.Pages.Analytics.SiteInsights.HeatMapChart.HoverOverCell(6, 7);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Mon 05:00: 986");

        Context.Pages.Analytics.SiteInsights.HeatMapChart.HoverOverCell(20, 3);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Fri 19:00: 923");

        Context.Pages.Analytics.SiteInsights.HeatMapChart.HoverOverCell(24, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Sun 23:00: 435");
    }
}
