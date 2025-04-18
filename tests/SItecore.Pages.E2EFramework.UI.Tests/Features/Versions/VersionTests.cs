// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using ApiConstants = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Constants;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Versions;

public class VersionTests : BaseFixture
{
    private const string PageName = "page A";
    private const string PageWithMultipleVersions = "PageWithMultipleVersions";
    private XMAppsApi xmAppsApi = new(TestRunSettings.XMAppsApi);
    private Item SiteSettingsItem => Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsPath);

    [OneTimeSetUp]
    public void CreatePageWithVersions()
    {
        Preconditions.AddLanguageAndRefreshSession("de", "DE");
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        var page = Preconditions.CreatePage(PageName, doNotDelete: true);

        for (int i = 0; i < 5; i++)
        {
            Context.TestItems[PageName].AddVersion();
        }

        Preconditions.AddComponent(page.itemId, page.path, RenderingId(SxaRenderings.RichText), version: 1);
        Preconditions.AddComponent(page.itemId, page.path, RenderingId(SxaRenderings.RichText), version: 3);
        Preconditions.AddComponent(page.itemId, page.path, RenderingId(SxaRenderings.RichText), version: 4);
        Preconditions.AddComponent(page.itemId, page.path, RenderingId(SxaRenderings.RichText), version: 5);
        Preconditions.AddComponent(page.itemId, page.path, RenderingId(SxaRenderings.RichText), version: 6);

        Context.Pages.TopBar.OpenSitesDropdown().SelectSite(Constants.SXAHeadlessSite);
        Context.Pages.TopBar.AppNavigation.OpenEditor();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(PageName);
    }


    [SetUp]
    public void SelectLanguageBeforeEveryTest()
    {
        if (Context.Pages.Editor.TopBar.GetSelectedLanguage() != "English")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
        }

        if (Context.Pages.Editor.TopBar.IsVersionListOpened)
        {
            Context.Pages.Editor.EditorHeader.CloseVersionsList();
        }
    }

    [OneTimeTearDown]
    public void CleanUpTestDataAfterAllTests()
    {
        Context.ApiHelper.CleanTestData(keepProtected: false);
        Context.TestItems.Clear(keepProtected: false);

        if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
        {
            Item item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/de-DE");
            Context.ApiHelper.PlatformGraphQlClient.RemoveSupportedLanguagesFromSiteSettings(SiteSettingsItem, item.itemId);
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(null, "/sitecore/system/Languages/de-DE");
        }
        else
        {
            xmAppsApi = new(TestRunSettings.XMAppsApi);
            var siteId = Context.Sites.Find(s => s.name.Equals(Constants.SXAHeadlessSite)).id;
            List<string> supportedLanguages = new List<string>
            {
                "en",
                "da"
            };
            xmAppsApi.UpdateSiteLanguages(siteId, supportedLanguages);
        }

        Context.Pages.Editor.LeftHandPanel.OpenSiteTree().RefreshTreeAtRootItem();
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    [Test, Order(11)]
    public void LastPublishableVersionOfThePage_IsOpened_OnAppStart()
    {
        Preconditions.CreatePage(PageWithMultipleVersions);
        for (int i = 1; i < 2; i++)
        {
            Context.TestItems[PageWithMultipleVersions].AddVersion();
        }

        var publishableFrom = Wrappers.Helpers.GetFormattedDateString(DateTime.Today.AddDays(+1));
        Context.ApiHelper.PlatformGraphQlClient
            .UpdateItemField(Context.TestItems[PageWithMultipleVersions].itemId, "__Valid from", publishableFrom, version: 2);

        Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite, pageId: Context.TestItems[PageWithMultipleVersions].itemId, language: "en", tenantName: Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().BeEquivalentTo("Version 1");
    }


    [Test, Order(10)]
    public void VersionListForPageWithMultipleVersions_ShowsAllAvailableVersions()
    {
        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        var count = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path).versions.Count;

        //Versions list shows all the version present for the item
        versionsList.Versions.Count.Should().Be(count);
        versionsList.Versions.Select(v => v.Number).ToList().Should().BeInDescendingOrder();
        versionsList.SelectVersion(1);
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .Versions.Find(v => v.IsHighlighted).Number.Should().Be(1);

        //Url updated with selected version from the list
        Context.Browser.PageUrl.Contains("sc_version=1");
        Context.Pages.Editor.EditorHeader.VersionsList.SelectVersion(2);
        Context.Browser.PageUrl.Contains("sc_version=2");
    }

    [Test, Order(8)]
    public void EditingVersionsSimultaneously_HistoryTrackedSeparately()
    {
        //Updates version 5
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(5);
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Edits version 5";
        Context.Pages.Editor.CurrentPage.TextInputs[0].SetSelection("Edits version 5");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.Bold);
        Context.Pages.Editor.CurrentPage.EmptyPlaceholders.Count.Should().Be(0);
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("<strong>Edits version 5</strong>");
        Context.Pages.Editor.EditorHeader.Undo(layoutChange: false);
        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeTrue();


        //Updates version 4
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(4);
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeFalse();
        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeFalse();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Edits version 4";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();
        Context.Pages.Editor.EditorHeader.Undo(layoutChange: false);

        //Updates version 5
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(5);
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();

        // Bug https://sitecore.atlassian.net/browse/PGS-2068
        //Context.Pages.Editor.TopBar.IsRedoActive().Should().BeTrue();
        //Context.Pages.Editor.TopBar.Redo();
        //Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("<strong>Edits version 5</strong>");
    }

    [Test, Order(7)]
    public void EditingMultipleVersions_AssignedDatasourceIsReflected()
    {
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(6);
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Rich Text 1";

        // Create a New DS for Rich text under test pages local datasource
        string localDataSourceId = Context.ApiHelper.PlatformGraphQlClient.GetChildIdByTemplateId(Context.TestItems[PageName].path, SxaDataSourceTemplateId);
        Item richText2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Rich Text 2", localDataSourceId, RenderingDataSourceTemplate(SxaRenderings.RichText));

        Context.Pages.Editor.EditorHeader.OpenVersions().OpenContextMenuOnVersion(6).InvokeDuplicate();
        Context.Pages.Editor.DuplicateVersionDialog.ClickDuplicateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        Context.Pages.Editor.CurrentPage.Renderings[0].Select();

        // Need to navigate up as CKE editor toolbar displays first
        Context.Pages.Editor.CurrentPage.RtEditorControls.SelectControl(RTEditorControls.Controls.GoToParent);
        Context.Pages.Editor.RightHandPanel.DesignContentTogle.TogleToContent();
        var dsDialog = Context.Pages.Editor.RightHandPanel.ContentSection.InvokeDatasourceDialog();

        dsDialog.DatasourceItemTree.GetItemByPath(richText2.name)?.Select();
        dsDialog.Assign();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Rich Text 2";
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(6);
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().Be("Rich Text 1");
    }

    [Test, Order(3)]
    public void CreationNewVersion_FromTimedNotification()
    {
        // Invoke a timed notification by switching to Danish language
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        var notification = Context.Pages.Editor.TimedNotification;
        using (new AssertionScope())
        {
            notification.Type.Should().Be(NotificationType.Warning);
            notification.Message.Should().Be("The version you selected does not exist");
            notification.Button.Text.Should().Be("Create a new version");
        }

        notification.Button.Click();
        Context.Pages.Editor.CreateVersionDialog.IsVisible.Should().BeTrue();
        Context.Pages.Editor.CreateVersionDialog.ClickCreateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.OpenVersions().Versions.Count.Should().Be(1);
        Context.Pages.Editor.EditorHeader.VersionsList.SelectVersion(1, isVersionExpectedInContext: true);
    }

    [Test, Order(2)]
    public void CreationNewVersion_ByEdit()
    {
        // Invoke a timed notification by switching to German language
        Context.Pages.Editor.TopBar.SelectLanguage("German");
        Context.Pages.Editor.TimedNotification.IsVisible.Should().BeTrue();
        Context.Pages.Editor.TimedNotification.Close();

        //Edit page in canvas
        var placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        var component = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab()
            .GetPageContentComponent("Rich Text");
        component.DragToPoint(placeholder);

        //New version should be created automatically with a success notification
        Context.Pages.Editor.TimedNotification.IsVisible.Should().BeTrue();
        Context.Pages.Editor.TimedNotification.Type.Should().Be(NotificationType.Success);
        Context.Pages.Editor.TimedNotification.Message.Should().Be($"Version 1 for \"{PageName}\" was automatically created");
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.EditorHeader.OpenVersions().Versions.Count.Should().Be(1);
        Context.Pages.Editor.EditorHeader.VersionsList.SelectVersion(1, isVersionExpectedInContext: true);
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [Test, Order(4)]
    public void CreationNewVersion_UsingCreateVersionButton()
    {
        //Open version 3 in editor make some changes
        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        versionsList.CreateVersionButtonEnabled.Should().BeTrue();
        var currentVersionCount = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path)
            .versions.Count;
        versionsList.SelectVersion(3);

        Context.Pages.Editor.CurrentPage.Renderings.First().Select();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Edits version 3";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        //Create new version using Create button
        Context.Pages.Editor.EditorHeader.OpenVersions()
            .OpenCreateVersionDialog()
            .ClickCreateButton();
        Context.Pages.Editor.EditorHeader.VersionsList.Versions.Count.Should().Be(currentVersionCount + 1);
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        //New version should have changes from the previous version in context
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().Be("Edits version 3");
    }

    [Test, Order(1)]
    public void CreateNewVersion_NonAdminUserVersionInFinalWorkflowState()
    {
        //set final workflow state
        var count = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path).versions.Count;

        Context.TestItems[PageName].SetWorkFlow(ApiConstants.SampleWorkFlowId, ver: 2);
        Context.TestItems[PageName].SetWorkflowState(ApiConstants.WorkFlowStateApproved, ver: 2);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
        Context.Pages.Editor.LeftHandPanel.SelectPage(PageName);

        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        versionsList.SelectVersion(2);
        var placeholder = Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].DropLocation;
        var component = Context.Pages.Editor.LeftHandPanel.OpenComponentsTab()
            .GetPageContentComponent("Rich Text");
        component.DragToPoint(placeholder);
        Context.Pages.Editor.TimedNotification.IsVisible.Should().BeTrue();
        Context.Pages.Editor.TimedNotification.Message.Should().Be($"Version {count + 1} for \"{PageName}\" was automatically created");
        Context.Browser.GetDriver().WaitForDotsLoader();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.CurrentPage.Renderings.First().Select();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "Edits version 2";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Be($"Version {count + 1}");

        //Switch versions to check if version 6 has same value as version 2
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(5);
        Context.Pages.Editor.EditorHeader.OpenVersions().SelectVersion(count + 1);
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().Be("Edits version 2");
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [Test, Order(9)]
    public void RenameVersion_FromContextMenu()
    {
        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();

        //Invoke rename dialog
        versionsList.OpenContextMenuOnVersion(2).InvokeRename();

        var renameVersionDialog = Context.Pages.Editor.RenameVersionDialog;
        using (new AssertionScope())
        {
            renameVersionDialog.HeaderText.Should().Be("Rename version");
            renameVersionDialog.RenameEnabled.Should().BeFalse();
            renameVersionDialog.CancelEnabled.Should().BeTrue();
        }

        renameVersionDialog.EnterItemName("Renamed version");
        renameVersionDialog.RenameEnabled.Should().BeTrue();
        renameVersionDialog.ClickRenameButton();
        versionsList.Versions.Find(v => v.Number.Equals(2)).Name.Should().Be("Renamed version");
        versionsList.Versions.Find(v => v.Number.Equals(2)).Select();
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Be("Renamed version");
        var versions = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path).versions;
        versions.Find(v => v.version.Equals(2)).versionName.Should().Be("Renamed version");
    }

    [Test, Order(5)]
    public void DeleteVersion_FromContextMenu()
    {
        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        versionsList.OpenContextMenuOnVersion(3).InvokeDelete();

        var deleteVersionDialog = Context.Pages.Editor.DeleteDialog;
        using (new AssertionScope())
        {
            deleteVersionDialog.HeaderText.Should().Be("Delete version");
            deleteVersionDialog.Message.Should().Be("Are you sure you want to delete \"Version 3\"?");
        }

        deleteVersionDialog.ClickDeleteButton();
        Context.Pages.Editor.EditorHeader.VersionsList.Versions.Should().NotContain(v => v.Number.Equals(3));
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        var versions = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path).versions;
        versions.Should().NotContain(v => v.version.Equals(3));
    }

    [Test, Order(6)]
    public void DuplicateVersion_FromContextMenu()
    {
        //Update version 1
        var count = Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageName].path).versions.Count;
        var versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        versionsList.SelectVersion(1);

        //Invoke duplicate on version 1
        versionsList = Context.Pages.Editor.EditorHeader.OpenVersions();
        versionsList.OpenContextMenuOnVersion(1).InvokeDuplicate();
        var duplicateVersionDialog = Context.Pages.Editor.DuplicateVersionDialog;

        duplicateVersionDialog.HeaderText.Should().Be("Duplicate version");
        duplicateVersionDialog.ClickDuplicateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        versionsList.Versions.Count.Should().Be(count + 1);

        versionsList.Versions.First().Name.Should().Be("Copy of Version 1");
        Context.Pages.Editor.EditorHeader.CloseVersionsList();
        Context.Pages.Editor.CurrentPage.EmptyPlaceholders.Count.Should().Be(0);
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().Be("Copy of Version 1");
    }

    [Test, Order(12)]
    public void CreateVersion_FromContentTree()
    {
        Item page = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page.name);

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.CreateLanguageVersionBtn.Click();

        Context.Pages.Editor.CreateVersionDialog.IsVisible.Should().BeTrue();
        Context.Pages.Editor.CreateVersionDialog.ClickCreateButton();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.OpenVersions().Versions.Count.Should().Be(1);
        Context.Pages.Editor.EditorHeader.VersionsList.SelectVersion(1, isVersionExpectedInContext: true);
    }
}
