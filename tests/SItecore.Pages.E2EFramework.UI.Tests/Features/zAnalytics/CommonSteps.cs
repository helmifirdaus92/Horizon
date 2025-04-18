// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.zAnalytics;

public static class CommonSteps
{
    public static readonly Dictionary<string, string> s_variants = new()
    {
        {
            "Default", "mock-PA-D"
        },
        {
            "Visitor from Copenhagen", "mock-PA-V1"
        },
        {
            "Visitor from Oslo", "mock-PA-V2"
        }
    };

    public static void OpenPageInsights()
    {
        Context.Pages.Analytics.Open(Constants.SXAHeadlessSite,tenantName:Context.TestTenant).OpenPageInsights();
    }

    public static void OpenSiteInsights()
    {
        Context.Pages.Analytics.Open(Constants.SXAHeadlessSite, tenantName:Context.TestTenant).OpenSiteInsights();
    }

    public static void SelectDropListVariants(string firstVariant, string secondVariant = null)
    {
        Context.Pages.Analytics.PageInsights.FirstVariantDropList.SelectDropListItem(firstVariant);

        if (secondVariant != null)
        {
            Context.Pages.Analytics.PageInsights.SecondVariantDropList.SelectDropListItem(secondVariant);
        }

        Context.Browser.GetDriver().WaitForHorizonIsStable();
    }

    public static void SelectTimeFilter(string page, string filter)
    {
        switch (page)
        {
            case "PageInsights":
                Context.Pages.Analytics.PageInsights.TimeFilterDropList.SelectDropListItem(filter);
                break;
            case "SiteInsights":
                Context.Pages.Analytics.SiteInsights.TimeFilterDropList.SelectDropListItem(filter);
                break;
        }
    }
}
