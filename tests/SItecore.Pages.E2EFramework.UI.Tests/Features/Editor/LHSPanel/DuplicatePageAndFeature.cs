// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using OpenQA.Selenium;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class DuplicatePageAndFeature : BaseFixture
{
    private string _duplicateItemToDelete = string.Empty;

    public enum ItemType
    {
        Page,
        Folder
    }

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

    [TestCase(ItemType.Page)]
    [TestCase(ItemType.Folder)]
    public void DuplicateSingleItem_CopyOfItemIsCreatedAtPresentState(ItemType type)
    {
        var countBefore = 0;
        Item itemToDuplicate;
        switch (type)
        {
            case ItemType.Folder:
                itemToDuplicate = Preconditions.CreateFolder();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                break;
            case ItemType.Page:
            default:
                itemToDuplicate = Preconditions.CreatePage();
                Preconditions.AddComponent(itemToDuplicate.itemId, itemToDuplicate.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDuplicate.name).Select();
                countBefore = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count;
                break;
        }

        _duplicateItemToDelete = $"Copy of {itemToDuplicate.name}";
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDuplicate.name).Hover().InvokeContextMenu().InvokeDuplicate();
        Context.Browser.PressKey(Keys.Enter);
        if (type == ItemType.Page)
        {
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be($"Copy of {itemToDuplicate.name}");
            Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().Be(itemToDuplicate.name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(i => i.Name).ToList()
            .Should().HaveCount(countBefore+1)
            .And.Contain(itemToDuplicate.name)
            .And.Contain($"Copy of {itemToDuplicate.name}");
    }

    [TestCase(ItemType.Page)]
    [TestCase(ItemType.Folder)]
    public void DuplicateItemWithSubItems_ChildItemsAreDuplicatedAsWell(ItemType type)
    {
        _duplicateItemToDelete = "DuplicateItemWithName";
        Item itemToDuplicate = type switch
        {
            ItemType.Folder => Preconditions.CreateFolder(),
            ItemType.Page => Preconditions.CreatePage(),
            _ => Preconditions.CreatePage()
        };
        Item child = Preconditions.CreatePage(parentId: itemToDuplicate.itemId);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        switch (type)
        {
            case ItemType.Folder:
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDuplicate.name).Hover().InvokeContextMenu().InvokeDuplicate();
                Context.Browser.PressKey(_duplicateItemToDelete);
                Context.Browser.PressKey(Keys.Enter);
                Context.Browser.WaitForDotsLoader();
                break;
            case ItemType.Page:
            default:
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(itemToDuplicate.name).Select().InvokeContextMenu().InvokeDuplicate();
                Context.Browser.PressKey(_duplicateItemToDelete);
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.LooseFocus();
                Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
                break;
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(i => i.Name).ToList()
            .Should().Contain(_duplicateItemToDelete);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(_duplicateItemToDelete).GetChildren().Select(i => i.Name).ToList()
            .Should().Contain(child.name)
            .And.HaveCount(1);
    }

    [Test]
    public void DuplicateItemWithNoCreateWritesUnder_DuplicateOptionIsDisabled()
    {
        _duplicateItemToDelete = string.Empty;
        var parent = Preconditions.CreatePage("parent");
        var child = Preconditions.CreatePage(parentId: parent.itemId);
        Context.ApiHelper.PlatformGraphQlClient.DenyCreateAccess(parent.itemId, TestRunSettings.UserEmail);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(parent.name).Expand();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(child.name).Select()
            .InvokeContextMenu().IsOptionEnabled(ContextMenu.ContextMenuButtons.Duplicate).Should().BeFalse();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Container.ClickOutside();
    }

    [TearDown]
    public void AddDuplicateItemToDelete()
    {
        if (_duplicateItemToDelete.Equals(string.Empty))
        {
            return;
        }

        Item duplicateItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{Constants.HomePagePath}/{_duplicateItemToDelete}");
        if (duplicateItem != null)
        {
            TestData.Items.Add(duplicateItem);
        }
    }
}
