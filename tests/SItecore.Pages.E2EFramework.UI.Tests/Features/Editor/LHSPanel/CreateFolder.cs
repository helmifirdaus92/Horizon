// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class CreateFolder : BaseFixture
{
    private readonly string _insertOptionsFieldName = "__masters";

    [OneTimeSetUp]
    public void UpdateInsertOptions_OpenSXASite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void ChooseEnglishLanguage()
    {
        Preconditions.OpenEnglishLanguage();
        CreateFolderSlidingPanel slidingPanel = Context.Pages.Editor.LeftHandPanel.GetCreateFolderPanelIfExists();
        slidingPanel?.CloseSlidingPanel();
    }

    [TestCase("folder", "click Enter")]
    [TestCase("page", "loose focus")]
    public void CreateFolderViaContextMenu(string parentItem, string confirmingAction)
    {
        Item parent = new();
        switch (parentItem)
        {
            case "page":
                parent = CreateParentItem();
                break;
            case "folder":
                parent = Preconditions.CreateFolder();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                break;
        }

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        CreateFolderItem(Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}"), "created folder", confirmingAction);

        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        items.Count.Should().Be(pagesCount + 1);
        items.Any(i => i.Name == "created folder").Should().BeTrue("Page is not visible in the tree");
    }

    [Test]
    public void PreviouslySelectedItemStillSelectedAfterCreatingNewFolder()
    {
        Item parent = CreateParentItem();

        Item page1 = Preconditions.CreatePage();
        Item page11 = Preconditions.CreatePage(parentId: page1.itemId);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{page1.name}").Expand();
        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(page11.name);

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        CreateFolderItem(Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}"), "created folder");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(selectedItem.Name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount + 1);
    }

    [Test]
    public void ContentTreeDoesNotScrollAfterCreatingFolder()
    {
        Logger.Write("Start creating 80 Pages ...............");
        Preconditions.CreateMultiplePages("EightyPagesTest", 80);
        Logger.Write("80 Pages created ...............");

        Item parent = CreateParentItem("zzzzzzzzzzz");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.ScrollToLastElement();
        Logger.Write("Scrolled to last ...............");

        TreeItem parentTreeItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"{parent.name}");
        CreateFolderItem(parentTreeItem, "FolderToScroll");

        parentTreeItem.IsItemVisible().Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").IsItemVisible().Should().BeFalse();
    }

    [Test]
    public void CancelFolderCreation()
    {
        Item parent = CreateParentItem();

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        CreateFolderSlidingPanel createFolderPanel = selectedItem.InvokeContextMenu().InvokeCreatePageFolder();
        createFolderPanel.SelectTemplate("Folder");

        TreeItem childItem = selectedItem.GetChildren().FirstOrDefault();
        childItem.SetDisplayName("New Folder");
        childItem.PressKey("ESC");

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(selectedItem.Name);

        Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
    }

    [TestCase("/*-+!@#$%&*()_.")]
    [TestCase("https://www.google.com.ua")]
    [TestCase("Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text Long text")]
    public void SpecifyInvalidFolderName_FolderNotCreated(string name)
    {
        Item parent = CreateParentItem();
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        CreateFolderItem(selectedItem, name);

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Error);
        notification.Message.Should().Be($"'{name}' is not a valid name");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(selectedItem.Name);
    }

    [TestCase("<script>window.location=\"http://google.com\"</script>")]
    [TestCase(" ")]
    public void InvalidFolderName_General_Message_FolderNotCreated(string name)
    {
        Item parent = CreateParentItem();
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        CreateFolderItem(selectedItem, name);

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Error);
        notification.Message.Should().BeOneOf($"'{name}' is not a valid name", $"The '{name}' folder cannot be created");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(selectedItem.Name);
    }

    [Test]
    public void SpecifyEmptyDisplayName_ItemNotCreated()
    {
        Item parent = CreateParentItem();
        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        selectedItem.Container.Hover();

        CreateFolderSlidingPanel createFolderPanel = selectedItem.InvokeContextMenu().InvokeCreatePageFolder();
        createFolderPanel.SelectTemplate("Folder");

        TreeItem childItem = selectedItem.GetChildren().FirstOrDefault();
        childItem.GetTextElement().Clear();

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo("The folder name cannot be empty");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(selectedItem.Name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

    [Test]
    public void CreateFolderWithoutCreateRights_CreateNotAvailable()
    {
        Item parent = CreateParentItem();
        Context.ApiHelper.PlatformGraphQlClient.DenyCreateAccess(parent.itemId, TestRunSettings.UserEmail);

        int pagesCount = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
        string childName = $"Folder {parent.name}";

        TreeItem parentItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);
        CreateFolderItem(parentItem, childName);

        string notification = Context.Pages.Editor.TimedNotification.Message;
        Context.Pages.Editor.WaitForNotificationToDisappear();
        notification.Should().BeEquivalentTo($"The '{childName}' folder cannot be created");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(pagesCount);
    }

    [Test]
    public void CreateFolderWithoutInsertOptions_NotAvailable()
    {
        Item parent = CreateParentItem(updateInsertOptions: false);
        TreeItem parentTreeItem = Context.Pages.Editor.LeftHandPanel.SelectPage(parent.name);

        parentTreeItem.Container.Hover();
        parentTreeItem.InvokeContextMenu().InvokeCreatePageFolder(ExpectSlidingPanel:false);

        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo("Folder could not be created. Insert options must be defined for parent item");
        notification.LinkUrl.Should().Be("https://doc.sitecore.com/xmc/en/developers/xm-cloud/assign-or-copy-insert-options.html");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Any(i => i.Name == "New Folder").Should().BeFalse();
    }

    [Test]
    public void CreateFolderForSpecificLanguage()
    {
        Item parent = CreateParentItem();
        string childName = $"Folder {parent.name}";

        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        CreateFolderItem(Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}"), childName);

        Item createdItemDa = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}", "da");
        Item createdItemEn = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{parent.path}/{childName}", "en");
        createdItemDa.versions.Count.Should().Be(1);
        createdItemDa.createdAt.Should().NotBeNull();
        createdItemEn.versions.Count.Should().Be(0);
        createdItemEn.createdAt.Should().BeNull();

        Context.Pages.Editor.TopBar.SelectLanguage("English");
    }

    private Item CreateParentItem(string name = null, bool updateInsertOptions = true)
    {
        Item parent = name == null ? Preconditions.CreatePage() : Preconditions.CreatePage(name);

        if (updateInsertOptions)
        {
            Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(parent.itemId, _insertOptionsFieldName, $"{Constants.TemplateFolderId}|{Constants.TemplatePageId}|{Constants.RedirectItemId}");
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        return parent;
    }

    private void CreateFolderItem(TreeItem parentItem, string folderName, string confirmingAction = "click Enter")
    {
        parentItem.Container.Hover();
        string parentName = parentItem.Name;

        CreateFolderSlidingPanel createFolderPanel = parentItem.InvokeContextMenu().InvokeCreatePageFolder();
        createFolderPanel.SelectTemplate("Folder");

        TreeItem childItem = parentItem.GetChildren().FirstOrDefault();
        childItem.SetDisplayName(folderName);

        switch (confirmingAction)
        {
            case "loose focus":
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.LooseFocus();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parentName}").Expand();
                break;
            case "click Enter":
                childItem.PressKey("Enter");
                break;
        }

        Context.Browser.WaitForHorizonIsStable();
    }
}
