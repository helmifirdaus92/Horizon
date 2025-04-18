// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features;

public class SaveConflicts : BaseFixture
{
    [OneTimeSetUp]
    public void OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void WaitForNotificationToDisappear()
    {
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void SaveChangesInLockedPage()
    {
        Item testPage = Preconditions.CreatePage();
        testPage.SetFieldValue("__Lock", $"<r owner=\"sitecore\\SomeoneElseUser\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].AddComponentButton.Click();
        Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.SelectComponentThumbnail("Image");

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.ItemLockedErrMsg);
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [TestCase("modified")]
    [TestCase("moved")]
    [TestCase("renamed")]
    public void SaveChangesInPageModifiedFromOutside(string action)
    {
        Item testPage = Preconditions.CreatePage();
        string pagePath = testPage.path;
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);
        switch (action)
        {
            case "modified":
                testPage.SetFieldValue("Title", "edited by other user");
                break;
            case "renamed":
                pagePath = Context.ApiHelper.PlatformGraphQlClient.RenameItem(testPage.itemId, "Name edited by other user").path;
                break;
            case "moved":
                Item folder = Preconditions.CreateFolder($"Folder {testPage.name}");
                pagePath = Context.ApiHelper.PlatformGraphQlClient.MoveItem(testPage.itemId, folder.path).path;
                break;
        }

        Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].AddComponentButton.Click();
        Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.SelectComponentThumbnail("Image");

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Warning);
        notification.Message.Should().BeEquivalentTo(Constants.PageHasBeenChangedMsg);
        notification.Button.Type.Should().Be(NotificationButtonType.Reload);
        notification.Button.Click();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        testPage = Context.ApiHelper.PlatformGraphQlClient.GetItem(pagePath);

        switch (action)
        {
            case "modified":
                testPage.GetFieldValue("Title").Should().Be("edited by other user");
                break;
            case "renamed":
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(testPage.name);
                break;
            case "moved":
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/Folder {testPage.name}").Expand();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(testPage.name);
                break;
        }
    }

    [Test]
    public void SaveChangesInDatasourceModifiedFromOutside()
    {
        Item testPage = Preconditions.CreatePage();
        Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Item datasource = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{testPage.path}/Data/Text 1");
        datasource.SetFieldValue("Text", "Modified DS");
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "New value";

        Context.Pages.Editor.SavingErrorDialog.WaitForCondition(t => t.IsVisible);
        var confirmationDialog = Context.Pages.Editor.SavingErrorDialog;
        confirmationDialog.Title.Should().Be("Saving error");
        confirmationDialog.Message.Should().Be("The item has been modified. The changes cannot be saved. Do you want to overwrite other changes?");
        confirmationDialog.Close();
        Context.Browser.GetDriver().WaitForDotsLoader();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().BeEquivalentTo("Modified DS");
        Context.Pages.Editor.CurrentPage.TextInputs[0].Clear();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "New value";
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().NotContain("New value");
    }

    [Test]
    public void ChangeContentInModifiedPageAndLeavePageBeforeSaveOccured()
    {
        Item testPage = Preconditions.CreatePage();
        Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "New value";
        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");

        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        //https://sitecore.atlassian.net/browse/PGS-3358
        //Unignore after bug fix
        //Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().BeEquivalentTo("New value");
    }

    [Test]
    public void SaveChangesInDeletedPageVersion()
    {
        Item testPage = Preconditions.CreatePage();
        testPage.AddVersion();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Context.ApiHelper.PlatformGraphQlClient.DeleteItemVersion(testPage.itemId, 2);

        Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].AddComponentButton.Click();
        Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.SelectComponentThumbnail("Title");
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Warning);
        notification.Message.Should().BeEquivalentTo(Constants.PageHasBeenChangedMsg);
        notification.Close();
        notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Success);
        notification.Message.Should().BeEquivalentTo($"Version 2 for \"{testPage.name}\" was automatically created");
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void zzzz_SaveChangesInDeletedPage()
    {
        Item testPage = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Context.ApiHelper.PlatformGraphQlClient.DeleteItem(testPage.itemId);

        Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].AddComponentButton.Click();
        Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery.SelectComponentThumbnail("Title");
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().BeEquivalentTo(NotificationType.Error);
        notification.Message.Should().BeEquivalentTo(Constants.PageDoesNotExistErrMsg);
        notification.Button.Type.Should().Be(NotificationButtonType.Reload);
        notification.Button.Click();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo("Home");
    }
}
