// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features;

public class OpenPage : BaseFixture
{
    private const string GetNumberOfRequestsScript = "return window.performance.getEntries().filter(r=>r.entryType == 'resource' || r.entryType == 'navigation').length;";
    private const string GetNumberOfIframeLoadsScript = "return window.performance.getEntries().filter(r=>r.initiatorType == 'iframe').length;";
    private const string IfScriptExecutedScript = "return window.xssTestVariable!=undefined";

    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [Test,Category("InvestigationReqForStagingConfig")]
    public void GoBackAndForwardBrowserHistoryByContentTree()
    {
        Item pageA = Preconditions.CreatePage();
        Item pageB = Preconditions.CreatePage();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        //Number of requests for initial load doesn't exceed threshold
        long browserRequestsBefore = Context.Browser.ExecuteJavaScript<long>(GetNumberOfRequestsScript);
        Context.Pages.Editor.LeftHandPanel.SelectPage(pageA.name);

        long browserRequestsAfter = Context.Browser.ExecuteJavaScript<long>(GetNumberOfRequestsScript);
        long requestDifference = Math.Abs(browserRequestsAfter - browserRequestsBefore);
        long pageRequests = (long)Context.Pages.Editor.CurrentPage.ExecuteJavaScript(GetNumberOfRequestsScript);
        requestDifference.Should().BeLessOrEqualTo(6);
        pageRequests.Should().BeLessOrEqualTo(50);

        long actualNumberOfIframeLoads = (long)Context.Pages.Editor.CurrentPage.ExecuteJavaScript(GetNumberOfIframeLoadsScript);
        actualNumberOfIframeLoads.Should().BeLessOrEqualTo(1);

        Context.Pages.Editor.LeftHandPanel.SelectPage(pageB.name);

        Context.Browser.GetDriver().Navigate().Back();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(pageA.name);
        Context.Browser.PageUrl.Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(pageA.itemId));

        Context.Browser.GetDriver().Navigate().Forward();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(pageB.name);
        Context.Browser.PageUrl.Should().Contain(Wrappers.Helpers.ConvertItemIdToGuid(pageB.itemId));
    }

    [Test]
    public void XSSScriptingInURLIsNotExecuted()
    {
        string url = Context.Pages.ClientUrl + "/editor/<script>xssTestVariable='abc'</script>/";
        Context.Browser.GoToUrl(new(url));
        Context.Browser.WaitForHorizonIsStable();

        bool scriptExecuted = Context.Browser.ExecuteJavaScript<bool>(IfScriptExecutedScript);
        scriptExecuted.Should().BeFalse();
    }
}
