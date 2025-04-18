// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Reflection;
using FluentAssertions;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Analytics;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public class SingleStatCardsTests : BaseFixture
{
    [TearDown]
    public void RemoveDataFromLocalStorage()
    {
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Default"]}');");
        Context.Browser.ExecuteJavaScript($"localStorage.removeItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}');");
    }

    [Test]
    public void SingleStatCardsDisplaysTrendWithIncomingData()
    {
        // Mock data
        AnalyticsData data = new();

        PropertyInfo propDefault = data.GetType().GetProperty("sessionCount");
        propDefault.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(5.0),
                    historic = Convert.ToDouble(6)
                }
            });

        propDefault = data.GetType().GetProperty("pageVariantViewBySessionRatio");
        propDefault.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(9.98),
                    historic = Convert.ToDouble(2.33)
                }
            });

        propDefault = data.GetType().GetProperty("pageVariantViewCount");
        propDefault.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(30),
                    historic = Convert.ToDouble(30)
                }
            });

        string serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Default"]}', JSON.stringify({serializedData}));");

        PropertyInfo prop = data.GetType().GetProperty("sessionCount");
        prop.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(0),
                    historic = Convert.ToDouble(0)
                }
            });

        prop = data.GetType().GetProperty("pageVariantViewBySessionRatio");
        prop.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(0),
                    historic = Convert.ToDouble(0)
                }
            });

        prop = data.GetType().GetProperty("pageVariantViewCount");
        prop.SetValue(
            data,
            new SingleStat
            {
                data = new SingleStat.Data
                {
                    current = Convert.ToDouble(0),
                    historic = Convert.ToDouble(0)
                }
            });

        serializedData = JsonConvert.SerializeObject(data);
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('{CommonSteps.s_variants["Visitor from Copenhagen"]}', JSON.stringify({serializedData}));");

        // Open Page Insights
        CommonSteps.OpenPageInsights();

        // Select 'Default' variant
        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectDropListItem("Default");
        Context.Pages.Analytics.PageInsights.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");

        // Check cards
        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("5");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("down");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("1");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("30");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("neutral");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("0");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("10");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("up");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("7.7");

        // Select 'Visitor from Copenhagen' variant
        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectDropListItem("Visitor from Copenhagen");

        // Check cards
        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("0");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("neutral");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Visitors).Should().Be("0");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("0");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("neutral");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.Views).Should().Be("0");

        Context.Pages.Analytics.PageInsights.GetSingleCardValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("0");
        Context.Pages.Analytics.PageInsights.GetTrendingDirection(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("neutral");
        Context.Pages.Analytics.PageInsights.GetTrendingValue(PageInsights.PageInsightsSingleStatCards.AvgPageViewsPerSession).Should().Be("0");
    }
}
