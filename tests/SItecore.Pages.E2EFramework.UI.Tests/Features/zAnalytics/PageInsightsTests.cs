// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class PageInsightsTests : BaseFixture
{
    [SetUp]
    public void OpenPageInsights()
    {
        CommonSteps.OpenPageInsights();
    }

    [Test]
    public void PageAnalytics_SingleStatTilesHasCorrectData()
    {
        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectDropListItem("Default");
        Context.Pages.Analytics.PageInsights.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("300");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("200");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("8");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("3");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("50");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("down");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("40");

        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectDropListItem("Visitor from Copenhagen");
        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("500");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("300");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("200");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("150");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("50");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("down");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("40");

        Context.Pages.Analytics.PageInsights.SecondVariantDropList.SelectDropListItem("Visitor from Oslo");
        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.ViewsVar2).Should().Be("200");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.ViewsVar2).Should().Be("down");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.ViewsVar2).Should().Be("300");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSessionVar2).Should().Be("300");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSessionVar2).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSessionVar2).Should().Be("240");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.VisitorsVar2).Should().Be("70");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.VisitorsVar2).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.VisitorsVar2).Should().Be("30");
    }

    [Test]
    public void PageInsights_LineAndColumnChartsHaveCorrectDataForBothVariants()
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(1);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 3677");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(3);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen: 5101");

        Context.Pages.Analytics.PageInsights.LineChart.HoverOverAxisTickLine(4);
        Context.Pages.Analytics.PageInsights.LineChart.HoverOverPoint(1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo: 2433");

        Context.Pages.Analytics.PageInsights.ChartTypeDropList.SelectDropListItem("Column chart");
        Context.Pages.Analytics.PageInsights.ColumnChartGrouped.HoverOverBar(3, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo, May 28: 3201");
        Context.Pages.Analytics.PageInsights.ColumnChartGrouped.HoverOverBar(6, 0);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Copenhagen, Feb 28: 6541");
    }

    [Test]
    public void PageInsights_HeatMapChartHasCorrectDataForBothVariants()
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(1).HoverOverCell(7, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Sun 06:00: 876");
        Context.Pages.Analytics.PageInsights.GetHeatMapChart(2).HoverOverCell(7, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Sun 06:00: 576");
    }

    [Test]
    public void PageInsights_SourceChartHasCorrectDataForBothVariants()
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");
        Context.Pages.Analytics.PageInsights.SourceChartGrouped.HoverOverBar(0, 1);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Visitor from Oslo, Home Page: 2420");
        Context.Pages.Analytics.PageInsights.SecondVariantDropList.SelectDropListItem("Remove");
        Context.Pages.Analytics.PageInsights.SourceChart.HoverOverBar(0, 2);
        Context.Pages.Analytics.ToolTip.Text.Should().Contain("Whats new: 185");
    }

    [TestCase("top variants", 1, 1, "Visitor from Copenhagen: 150")]
    [TestCase("top variants", 1, 2, "Visitor from Oslo: 60")]
    [TestCase("top variants", 1, 3, "Default: 50")]
    [TestCase("top countries", 5, 1, "Visitor from Copenhagen, United Arab Emirates: 141")]
    [TestCase("top countries", 3, 2, "Visitor from Oslo, Ireland: 185")]
    [TestCase("browser", 4, 1, "Visitor from Copenhagen, Opera: 141")]
    [TestCase("browser", 2, 2, "Visitor from Oslo, Firefox: 234")]
    [TestCase("operating system", 3, 1, "Visitor from Copenhagen, Android: 185")]
    [TestCase("operating system", 4, 2, "Visitor from Oslo, iOS: 141")]
    public void PageInsights_HorizontalChartHasCorrectDataForBothVariants(string chartName, int series, int variant, string tooltipValue)
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        switch (chartName)
        {
            case "top variants":
                Context.Pages.Analytics.PageInsights.TopVariantsChart.HoverOverBarInChartSeries(series, variant);
                break;
            case "top countries":
                Context.Pages.Analytics.PageInsights.TopCountriesChartGrouped.HoverOverBarInChartSeries(series, variant);
                break;
            case "browser":
                Context.Pages.Analytics.PageInsights.BrowserChartGrouped.HoverOverBarInChartSeries(series, variant);
                break;
            case "operating system":
                Context.Pages.Analytics.PageInsights.OperatingSystemChartGrouped.HoverOverBarInChartSeries(series, variant);
                break;
        }

        Context.Pages.Analytics.ToolTip.Text.Should().Contain(tooltipValue);
    }

    [Test]
    public void PageInsights_InfoOnChartsHaveCorrectData()
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.LineChart);
        Context.Pages.Analytics.PageInsights.HoverOverSingleCardInfo(PageInsights.PageInsightsSingleStatCards.Visitors);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageTextForSingleStatCard(PageInsights.PageInsightsSingleStatCards.Visitors));
        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.LineChart);
        Context.Pages.Analytics.PageInsights.HoverOverSingleCardInfo(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageTextForSingleStatCard(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession));
        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.LineChart);
        Context.Pages.Analytics.PageInsights.HoverOverSingleCardInfo(PageInsights.PageInsightsSingleStatCards.Views);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageTextForSingleStatCard(PageInsights.PageInsightsSingleStatCards.Views));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.LineChart);
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.LineChartInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.LineChartInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.GetHeatMapChart(1));
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.HeatMapInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.HeatMapInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.TopVariantsChart);
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.TopPagesInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.TopPagesInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.TopCountriesChartGrouped);
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.TopCountriesInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.TopCountriesInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.SourceChartGrouped);
        Context.Pages.Analytics.SiteInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.SourceInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.SourceInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.BrowserChartGrouped);
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.BrowserInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.BrowserInfo));

        Context.Pages.Analytics.PageInsights.CLickOnChartElementAndWaitInfoMsgToDisappear(Context.Pages.Analytics.PageInsights.OperatingSystemChartGrouped);
        Context.Pages.Analytics.PageInsights.HoverOverInfo(Context.Pages.Analytics.PageInsights.OperatingSystemInfo);
        Context.Pages.Analytics.PageInsights.OverlayInfoText
            .Should().Be(Context.Pages.Analytics.PageInsights.GetInfoMessageFromHtml(Context.Pages.Analytics.PageInsights.OperatingSystemInfo));
    }

    [Test]
    public void PageInsights_NewlyCreatedVariantCanBeAdded()
    {
        string newVariant = "variant_1";
        Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
        Context.Pages.TopBar.AppNavigation.PersonalizationTabIsSelected.Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.ClickOnCreateNew();

        CreateDialog dialog = Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.CreateDialog;
        dialog.HeaderText.Should().Be("Create new page variant");
        dialog.ActiveStep.Should().Be("Name your page variant");
        dialog.EnterItemName("abc");
        dialog.ClickNextButton();
        dialog.ActiveStep.Should().Be("Create your audience");
        dialog.Close();

        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.CreateNewVariant(newVariant);
        Context.Pages.TopBar.AppNavigation.OpenAnalyzePanel();
        Context.Pages.TopBar.AppNavigation.AnalyzeTabIsSelected.Should().BeTrue();

        Context.Pages.Analytics.PageInsights.FirstVariantDropList.CheckIfDropListItemExists(newVariant);
        Context.Pages.Analytics.PageInsights.SecondVariantDropList.CheckIfDropListItemExists(newVariant);
    }

    [Test]
    public void PageInsights_SwitchBetweenPages_ContentKept()
    {
        CommonSteps.SelectTimeFilter("PageInsights", "30 days");
        CommonSteps.SelectDropListVariants("Visitor from Copenhagen", "Visitor from Oslo");
        Context.Pages.Analytics.ContentTree.GetItemByPath($"Home/About").Select();
        Context.Pages.Analytics.PageInsights.DropListsInView.Equals(1);
        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectedValue.Should().Be("Default");
        Context.Pages.Analytics.PageInsights.SecondVariantDropList.SelectedValue.Should().Be("");
        Context.Pages.Analytics.PageInsights.TimeFilterDropList.SelectedValue.Should().Be("30 days");
    }

    [Test]
    public void PageInsights_SwitchBetweenPagesAndAnalyzeTabs_KeepsContextPage()
    {
        Context.Pages.Analytics.ContentTree.GetItemByPath($"Home/About").Select();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.TopBar.AppNavigation.EditorTabIsActive.Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("About");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home").Select();
        Context.Pages.TopBar.AppNavigation.OpenAnalyzePanel();
        Context.Pages.TopBar.AppNavigation.AnalyzeTabIsSelected.Should().BeTrue();
        Thread.Sleep(2000);
        Context.Pages.Analytics.ContentTree.SelectedItem.Name.Should().Be("Home");
    }
}
