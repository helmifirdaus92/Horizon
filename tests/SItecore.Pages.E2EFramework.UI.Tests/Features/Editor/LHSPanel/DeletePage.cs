// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class DeletePage : BaseFixture
{
    [OneTimeSetUp]
    public void SetTestContext()
    {
        // Set Site to test site
        Preconditions.OpenSXAHeadlessSite();

        // Set language to default
        Preconditions.OpenEnglishLanguage();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [SetUp]
    public void StartTestsAtRootItem()
    {
        if (!Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.IsSelected)
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
        }
    }

    [TestCase("Page", "Single item warning")]
    [TestCase("Page with subPage", "Item with sub items warning")]
    [TestCase("Folder with subPage", "Item with sub items warning")]
    [TestCase("Page with data-source", "Single item warning")]
    public void DeletePageOrFolderViaContextMenu_ItemAndChildItemsAreDeleted(string itemType, string warningMessageType)
    {
        int countBefore=0;
        string errorMessage = "Are you sure you want to delete \"Page_name\"?";
        if (warningMessageType == "Item with sub items warning")
        {
            errorMessage = "Are you sure you want to delete \"Page_name\"? This page has sub-pages which will also be deleted if you delete this page.";
        }

        Item itemToDelete;
        switch (itemType)
        {
            case "Page with subPage":
                itemToDelete = Preconditions.CreatePage("Page with subPage" + DataHelper.RandomString());
                Preconditions.CreatePage("ChildPage" + DataHelper.RandomString(), parentId: itemToDelete.itemId);
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Select().InvokeContextMenu().InvokeDelete();
                break;
            case "Folder with subPage":
                itemToDelete = Preconditions.CreateFolder("Folder with subPage" + DataHelper.RandomString());
                Preconditions.CreatePage("ChildPage" + DataHelper.RandomString(), parentId: itemToDelete.itemId);
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Hover().InvokeContextMenu().InvokeDelete();
                break;
            case "Page with data-source":
                itemToDelete = Preconditions.CreatePage("Page with data-source" + DataHelper.RandomString());
                Preconditions.AddComponent(itemToDelete.itemId, itemToDelete.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Select();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.InvokeContextMenu().InvokeDelete();
                break;
            default:
                itemToDelete = Preconditions.CreatePage("PageA" + DataHelper.RandomString());
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Select().InvokeContextMenu().InvokeDelete();
                break;
        }

        // Facade API checks for some indexing, so there is a need to wait for some time
        Thread.Sleep(1000);

        Context.Pages.Editor.DeleteDialog.Message.Should().Be(errorMessage.Replace("Page_name", itemToDelete.name));
        Context.Pages.Editor.DeleteDialog.ClickDeleteButton();
        if (itemType != "Folder with subPage")
        {
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(countBefore-1);
    }

    [Test]
    public void DeleteAPageNotInContext_PageRemainsInContext()
    {
        Item itemToDelete = Preconditions.CreatePage("ItemToDelete" + DataHelper.RandomString());
        Item pageInContext = Preconditions.CreatePage("PageInContext" + DataHelper.RandomString());
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageInContext.name).Select();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Hover().InvokeContextMenu().InvokeDelete();

        Context.Pages.Editor.DeleteDialog.ClickDeleteButton();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be(pageInContext.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(i => i.Name).ToList().Should()
            .NotContain(itemToDelete.name);
    }

    [Test]
    public void UserCancelsInDelete_ItemIsNotDeleted()
    {
        Item itemToDelete = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        var countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Select().InvokeContextMenu().InvokeDelete();
        Context.Pages.Editor.DeleteDialog.ClickCancelButton();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be(itemToDelete.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().Be(countBefore);
    }

    [Test]
    public void UserWithNoDeleteAccess_DeleteOptionIsDisabled()
    {
        Item itemToDelete = Preconditions.CreatePage();
        Context.ApiHelper.PlatformGraphQlClient.DenyDeleteAccess(itemToDelete.itemId, TestRunSettings.UserEmail);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDelete.name).Select()
            .InvokeContextMenu().IsOptionEnabled(ContextMenu.ContextMenuButtons.Delete).Should().BeFalse();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.ClickOutside();
    }

    /*
     * Delete an item at root level, duplicated a root item
     * Should work same as normal page delete, and home item should be resolved in context
     */
    [Test]
    public void DeleteDuplicatePage_ItemIsDeleted()
    {
        var testPage = Preconditions.CreatePage();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        Context.Browser.WaitForHorizonIsStable();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(testPage.name).Select()
            .InvokeContextMenu().InvokeDuplicate();

        Context.Browser.WaitForHorizonIsStable();

        // Facade API checks for some indexing, so there is a need to wait for some time
        Thread.Sleep(1000);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.PressKey("Enter");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be($"Copy of {testPage.name}");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.InvokeContextMenu().InvokeDelete();
        Context.Pages.Editor.DeleteDialog.ClickDeleteButton();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(i => i.Name).ToList().Should().NotContain($"Copy of {testPage.name}");

        //BUG https://sitecore.atlassian.net/browse/PGS-2722
        //Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
    }

    [TestCase("Folder")]
    [TestCase("Page")]
    public void DeleteChildItem_RootItemIsSelected(string parentType)
    {
        Item parentItem = parentType switch
        {
            "Page" => Preconditions.CreatePage(),
            "Folder" => Preconditions.CreateFolder(),
            _ => new Item()
        };

        Item itemToDelete = Preconditions.CreatePage(parentId: parentItem.itemId);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"{parentItem.name}/{itemToDelete.name}").Select().InvokeContextMenu().InvokeDelete();
        Context.Pages.Editor.DeleteDialog.ClickDeleteButton();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(i => i.Name).ToList().Should().Contain(parentItem.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be("Home");
    }
}
