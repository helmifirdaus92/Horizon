// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests;

public class StartAbnTests : BaseFixture
{
    private Item _testPage;
    private string _friendlyId;

    [OneTimeSetUp]
    public void OpenSiteAndCreatePage()
    {
        Preconditions.OpenSXAHeadlessSite();

        // Create test page
        _testPage = Preconditions.CreatePage(doNotDelete: true);

        // Add component to the page
        var presentationDetails = Preconditions.AddComponent(_testPage.itemId, _testPage.path, RenderingId(SxaRenderings.RichText));

        string renderingInstanceId = MockDataHelper.ParseInstanceId(presentationDetails);
        _friendlyId = MockDataHelper.ConstructFriendlyId(_testPage.itemId, renderingInstanceId);
    }

    [TearDown]
    public void CleanUp()
    {
        // remove the entry from local storage
        Context.Browser.ExecuteJavaScript("localStorage.removeItem('mock-flow-definitions');");
    }

    [Test]
    public void StartTestNotFullyConfigured_NotificationAppears()
    {
        var serData = CreateSerData("experiment1", "DRAFT");
        SetLocalStorage(serData);

        Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.StartExperiment();

        var checkList = Context.Pages.Editor.RightHandPanel.ApplicationTestComponent.GetStartTestCheckList();

        checkList.GetChecklistItems().Should().HaveCount(3);

        var expectedItems = new List<string>
        {
            "One or more variants have not been populated",
            "One or more variants have no traffic allocated and needs configuration",
            "Configure goal for this test"
        };
        checkList.GetChecklistItems().Should().BeEquivalentTo(expectedItems);
        checkList.ClickOkButton();
    }

    private string CreateSerData(string experimentName, string status)
    {
        return MockDataHelper.CreateAndFillSimpleMockFlowDefinitionsWithWrongTrafficAllocationJson(
            _friendlyId,
            experimentName,
            Constants.SXASiteItemID.ToLower(),
            status);
    }

    private void SetLocalStorage(string serData)
    {
        // Add local storage key
        Context.Browser.ExecuteJavaScript($"localStorage.setItem('mock-flow-definitions', JSON.stringify({serData}));");
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name != _testPage.name)
        {
            Context.Pages.Editor.LeftHandPanel.SelectPage(_testPage.name);
        }

        Context.Pages.Editor.CurrentPage.GetRenderingByName("Rich Text").Select();
    }
}
