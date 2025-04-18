// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class ContentTreeDragAndDrop : BaseFixture
{
    [SetUp]
    public void OpenSXASite()
    {
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();

        if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Name != "Home")
        {
            Context.Pages.Editor.LeftHandPanel.SelectPage("Home");
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }
    }

    [Test]
    public void FromSiblingToChildLevel()
    {
        // Create Page A and Page B as siblings
        Item pageA = Preconditions.CreatePage();
        Item pageB = Preconditions.CreatePage();

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        // Drag Page A into Page B
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == pageA.name).Container, items.Find(n => n.Name == pageB.name).Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {pageA.name} into {pageB.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(pageA.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(pageA.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Parent.Name.Should().BeEquivalentTo(pageB.name);
    }

    [Test]
    public void FromChildToSiblingLevel()
    {
        // Create Page B as a child for Page A
        Item pageA = Preconditions.CreatePage(name: "Parent");
        Item pageB = Preconditions.CreatePage(name: "Child", parentId: pageA.itemId);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(i => i.Name == pageA.name).Expand();

        // Drag Page A into Page B
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == pageB.name).Container, items.Find(n => n.Name == "Home").Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {pageB.name} into Home");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(pageB.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(pageB.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").GetVisibleChildren().Select(item=>item.Name).ToList().Should().Contain(pageA.name);
    }

    [Test]
    public void FromChildToParentLevel()
    {
        // Create tree of pages
        Item parentPage = Preconditions.CreatePage();
        Item firstLevelPage = Preconditions.CreatePage(parentId: parentPage.itemId);
        Item secondLevelPage = Preconditions.CreatePage(parentId: firstLevelPage.itemId);
        Item lastLevelPage = Preconditions.CreatePage(parentId: secondLevelPage.itemId);
        Item pageToBeMoved = Preconditions.CreatePage("Page To Be Moved", parentId: secondLevelPage.itemId);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parentPage.name}/{firstLevelPage.name}/{secondLevelPage.name}").Expand();

        // Drag pageToBeMoved into parentPage
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == pageToBeMoved.name).Container, items.Find(n => n.Name == parentPage.name).Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {pageToBeMoved.name} into {parentPage.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(pageToBeMoved.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(pageToBeMoved.name);
        TreeItem sibling = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.NextSibling;
        sibling.Name.Should().BeEquivalentTo(firstLevelPage.name);
        sibling.Expand();
        List<TreeItem> children = sibling.GetChildren().ToList();
        children.Count().Should().Be(1);
        children.First().Expand();
        children.First().GetChildren().Count().Should().Be(1);
    }

    [Test]
    public void FromChildToSiblingChildLevel()
    {
        // Create tree of pages
        Item firstParentPage = Preconditions.CreatePage();
        Item firstChildPage = Preconditions.CreatePage(parentId: firstParentPage.itemId);
        Item secondParentPage = Preconditions.CreatePage();
        Item secondChildPage = Preconditions.CreatePage(parentId: secondParentPage.itemId);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{firstParentPage.name}").Expand();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{secondParentPage.name}").Expand();

        // Drag secondChildPage into parentPage
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == secondChildPage.name).Container, items.Find(n => n.Name == firstParentPage.name).Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {secondChildPage.name} into {firstParentPage.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(i => i.Name == firstParentPage.name).IsExpanded.Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(secondChildPage.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(secondChildPage.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Parent.Name.Should().BeEquivalentTo(firstParentPage.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(i => i.Name == secondParentPage.name).GetChildren().Count().Should().Be(0);
    }

    [Test]
    public void FolderWithContextPageUnderIt()
    {
        // Create tree of pages
        Item folder = Preconditions.CreateFolder(TestContext.CurrentContext.Test.MethodName);
        Item childPage = Preconditions.CreatePage(parentId: folder.itemId);
        Item grandChildPage = Preconditions.CreatePage(parentId: childPage.itemId);
        Item secondPage = Preconditions.CreatePage();

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        var folderItem = items.Find(i => i.Name == folder.name);
        folderItem.Expand();
        folderItem.GetChildren().First().Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(grandChildPage.name);
        folderItem.Collapse();

        // Drag folder into secondPage
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == folder.name).Container, items.Find(n => n.Name == secondPage.name).Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {folder.name} into {secondPage.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(el => el.Name == folder.name).Expand();
        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(grandChildPage.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(grandChildPage.name);
        selectedItem.Parent.Name.Should().BeEquivalentTo(childPage.name);
        selectedItem.Parent.Parent.Name.Should().BeEquivalentTo(folder.name);
        selectedItem.Parent.Parent.Parent.Name.Should().BeEquivalentTo(secondPage.name);
    }

    [Test]
    public void FolderWithoutContextPageUnderIt()
    {
        // Create tree of pages
        Item page1 = Preconditions.CreatePage("page1");
        Item page2 = Preconditions.CreatePage("page2");
        Item folder = Preconditions.CreateFolder(TestContext.CurrentContext.Test.MethodName);
        Item childPage = Preconditions.CreatePage(parentId: folder.itemId);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page1.name);

        // Drag folder into page2
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == folder.name).Container, items.Find(n => n.Name == page2.name).Container);

        // Check item moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {folder.name} into {page2.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(page1.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page1.name);
        selectedItem.NextSibling.Name.Should().BeEquivalentTo(page2.name);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(el => el.Name == folder.name).Expand();
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        TreeItem lastItem = items.Find(i => i.Name == childPage.name);
        lastItem.Parent.Name.Should().Be(folder.name);
        lastItem.Parent.Parent.Name.Should().Be(page2.name);
        lastItem.Parent.Parent.Parent.Name.Should().Be("Home");
    }

    [Test]
    public void ParentOfSourceItemShouldStayExpanded()
    {
        // Create tree of pages
        Item page1 = Preconditions.CreatePage();
        Item page11 = Preconditions.CreatePage(parentId: page1.itemId);
        Item page12 = Preconditions.CreatePage(parentId: page1.itemId);
        Item folder = Preconditions.CreateFolder(TestContext.CurrentContext.Test.MethodName);
        Item childPage1 = Preconditions.CreatePage(parentId: folder.itemId);
        Item childPage2 = Preconditions.CreatePage(parentId: folder.itemId);
        Item destinationPage = Preconditions.CreatePage();

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(destinationPage.name);
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        items.Find(i => i.Name == folder.name).Expand();
        items.Find(i => i.Name == page1.name).Expand();

        // Drag pages into destinationPage
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == childPage1.name).Container, items.Find(n => n.Name == destinationPage.name).Container);
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {childPage1.name} into {destinationPage.name}");
        Context.Pages.Editor.TimedNotification.Close();

        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == page11.name).Container, items.Find(n => n.Name == destinationPage.name).Container);
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {page11.name} into {destinationPage.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        // Check items moved
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        items.Find(i => i.Name == folder.name).IsExpanded.Should().BeTrue();
        items.Find(i => i.Name == folder.name).GetChildren().Count().Should().Be(1);
        items.Find(i => i.Name == page1.name).IsExpanded.Should().BeTrue();
        items.Find(i => i.Name == page1.name).GetChildren().Count().Should().Be(1);
        items.Find(i => i.Name == destinationPage.name).GetChildren().Count().Should().Be(2);
    }

    [Test]
    public void OrderOfItemsIsRetainedAfterDragAndDrop()
    {
        // Create pages
        Item parent = Preconditions.CreatePage("parent");
        Item page1 = Preconditions.CreatePage("page1", parentId: parent.itemId);
        Item page2 = Preconditions.CreatePage("page2", parentId: page1.itemId);
        Item page3 = Preconditions.CreatePage("page3", parentId: page2.itemId);
        List<string> childrenNames = new()
        {
            page1.name,
            page2.name,
            page3.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}/{page1.name}/{page2.name}").Expand();
        TreeItem page3Item = Context.Pages.Editor.LeftHandPanel.SelectPage(page3.name);

        // Drag page3 into parent item
        Context.Browser.GetDriver().DragAndDropElement(page3Item.Container, Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}").Container);
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {page3.name} into {parent.name}");
        Context.Pages.Editor.TimedNotification.Close();

        TreeItem page1Item = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(n => n.Name == page1.name);
        page1Item.IsExpanded.Should().BeFalse();
        page1Item.Expand();

        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == page2.name).Container, items.Find(n => n.Name == parent.name).Container);
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"You placed {page2.name} into {parent.name}");
        Context.Pages.Editor.TimedNotification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        // Check items moved
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        List<TreeItem> children = items.Find(i => i.Name == parent.name).GetChildren().ToList();
        children.Count().Should().Be(childrenNames.Count);

        for (int i = 0; i < childrenNames.Count; i++)
        {
            childrenNames[i].Should().Be(children[i].Name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page2.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page2.name);
    }

    [Test]
    public void CollapsedItemNotToExpandWhenHoveredOnItself()
    {
        // Create pages
        Item page1 = Preconditions.CreatePage();
        Item page2 = Preconditions.CreatePage(parentId: page1.itemId);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SelectPage(page1.name);

        // Hover page on itself
        Context.Browser.GetDriver().DragAndMoveElement(selectedItem.Container, selectedItem.Container);

        // Check item collapsed
        TreeItem page1Item = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Find(n => n.Name == page1.name);
        page1Item.IsExpanded.Should().BeFalse();
        page1Item.GetChildren().Count().Should().Be(1);
    }

    [Test]
    public void UndoDragAndDropOperation()
    {
        // Create pages
        Item page1 = Preconditions.CreatePage("page123");
        Item page2 = Preconditions.CreatePage("page456");

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        // Drag pages into destinationPage
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == page1.name).Container, items.Find(n => n.Name == page2.name).Container);

        // Undo drag and drop
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page1.name} into {page2.name}");
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        notification.Button.Click();        
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // Checks
        TreeItem selectedItem = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem;
        selectedItem.Name.Should().BeEquivalentTo(page1.name);
        selectedItem.NextSibling.Name.Should().BeEquivalentTo(page2.name);
    }

    [Test]
    public void DragAndDropBeforeAnItem()
    {
        // Create pages
        Item parent = Preconditions.CreatePage("parentA");
        Item page1 = Preconditions.CreatePage("page1A", parentId: parent.itemId);
        Item page2 = Preconditions.CreatePage("page2A", parentId: parent.itemId);
        Item page3 = Preconditions.CreatePage("page3A", parentId: parent.itemId);
        List<string> childrenNames = new()
        {
            page1.name,
            page3.name,
            page2.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}").Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page3.name);

        // Drag page3 before page2
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.DragAndDropItem(
            items.Find(n => n.Name == page3.name),
            items.Find(n => n.Name == page2.name),
            ItemMovePosition.Before);

        // Check item being moved
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page3.name} above {page2.name}");
        notification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        List<TreeItem> children = items.Find(i => i.Name == parent.name).GetChildren().ToList();
        children.Count().Should().Be(childrenNames.Count);

        for (int i = 0; i < childrenNames.Count; i++)
        {
            childrenNames[i].Should().Be(children[i].Name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page3.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page3.name);
    }

    [Test]
    public void DragAndDropAfterAnItem()
    {
        // Create pages
        Item parent = Preconditions.CreatePage("parentB");
        Item page1 = Preconditions.CreatePage("page1B", parentId: parent.itemId);
        Item page2 = Preconditions.CreatePage("page2B", parentId: parent.itemId);
        Item page3 = Preconditions.CreatePage("page3B", parentId: parent.itemId);
        List<string> childrenNames = new()
        {
            page2.name,
            page1.name,
            page3.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}").Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page1.name);

        // Drag page1 after page2
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.DragAndDropItem(
            items.Find(n => n.Name == page1.name),
            items.Find(n => n.Name == page2.name),
            ItemMovePosition.After);

        // Check item being moved
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page1.name} below {page2.name}");
        notification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        List<TreeItem> children = items.Find(i => i.Name == parent.name).GetChildren().ToList();
        children.Count().Should().Be(childrenNames.Count);

        for (int i = 0; i < childrenNames.Count; i++)
        {
            childrenNames[i].Should().Be(children[i].Name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page1.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page1.name);
    }

    [Test]
    public void DragAndDropAfterParent()
    {
        // Create pages
        Item parent = Preconditions.CreatePage("parentC");
        Item page1 = Preconditions.CreatePage("page1C", parentId: parent.itemId);
        Item page2 = Preconditions.CreatePage("page2C", parentId: parent.itemId);
        Item page22 = Preconditions.CreatePage("page22C", parentId: page2.itemId);
        Item page3 = Preconditions.CreatePage("page3C", parentId: parent.itemId);
        List<string> childrenNames = new()
        {
            page1.name,
            page2.name,
            page22.name,
            page3.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}/{page2.name}").Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page1.name);

        // Drag page22 after page2
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.DragAndDropItem(
            items.Find(n => n.Name == page22.name),
            items.Find(n => n.Name == page2.name),
            ItemMovePosition.After);

        // Check item being moved
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page22.name} below {page2.name}");
        notification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        List<TreeItem> children = items.Find(i => i.Name == parent.name).GetChildren().ToList();
        children.Count().Should().Be(childrenNames.Count);

        for (int i = 0; i < childrenNames.Count; i++)
        {
            childrenNames[i].Should().Be(children[i].Name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page22.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page22.name);
    }

    [TestCase(ItemMovePosition.Into, "into")]
    [TestCase(ItemMovePosition.After, "below")]
    [TestCase(ItemMovePosition.Before, "above")]
    public void OrderOfItemsRetainsAfterUndo(ItemMovePosition position, string location)
    {
        // Create pages
        Item parent = Preconditions.CreatePage($"parent{location}");
        Item page1 = Preconditions.CreatePage($"page1{location}", parentId: parent.itemId);
        Item page2 = Preconditions.CreatePage($"page2{location}", parentId: parent.itemId);
        Item page3 = Preconditions.CreatePage($"page3{location}", parentId: parent.itemId);
        List<string> childrenNames = new()
        {
            page1.name,
            page2.name,
            page3.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{parent.name}").Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(page2.name);

        // Drag page2 into/before/after page3
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.DragAndDropItem(
            items.Find(n => n.Name == page2.name),
            items.Find(n => n.Name == page3.name),
            position);

        // Undo drag and drop
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page2.name} {location} {page3.name}");
        notification.Button.Click();

        // Check items not being moved
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        List<TreeItem> children = items.Find(i => i.Name == parent.name).GetChildren().ToList();
        children.Count().Should().Be(childrenNames.Count);

        for (int i = 0; i < childrenNames.Count; i++)
        {
            childrenNames[i].Should().Be(children[i].Name);
        }

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page2.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page2.name);
    }

    [Test]
    public void DragItemBeforeRoot()
    {
        // Create pages
        Item page1 = Preconditions.CreatePage();
        Item page11 = Preconditions.CreatePage(parentId: page1.itemId);
        List<string> itemNames = new()
        {
            page11.name,
            page1.name
        };

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath($"Home/{page1.name}").Expand();

        // Drag page11 before Home
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.DragAndDropItem(
            items.Find(n => n.Name == page11.name),
            items.Find(n => n.Name == "Home"),
            ItemMovePosition.Before);

        // Check item being moved
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Message.Should().BeEquivalentTo($"You placed {page11.name} above Home");
        notification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();

        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        items[0].Name.Should().Be(page11.name);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(page1.name).Parent.Name.Should().Be("Home");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().BeEquivalentTo(page11.name);
        Context.Pages.Editor.RightHandPanel.HeaderText.Should().BeEquivalentTo(page11.name);
    }

    [Test]
    public void CantMoveItemWithoutWriteRights()
    {
        // Create Page A and Page B as siblings
        Item pageA = Preconditions.CreatePage();
        Item pageB = Preconditions.CreatePage();

        // Restrict write access for Page A
        Context.ApiHelper.PlatformGraphQlClient.DenyWriteAccess(pageA.itemId, TestRunSettings.UserEmail);

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        // Drag Page A into Page B
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == pageA.name).Container, items.Find(n => n.Name == pageB.name).Container);

        // Check item not moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"There was an error moving the item '{pageA.name}' in the Content Tree");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();

        //Context.Pages.Editor.LeftHandPanel.SelectPage(pageA.name).NextSibling.Name.Should().BeEquivalentTo(pageB.name);
    }

    [Test]
    public void FailureInBackendWhenDragAndDropAnItem()
    {
        // Create Page A and Page B as siblings
        Item pageA = Preconditions.CreatePage();
        Item pageB = Preconditions.CreatePage();

        // Open Editor
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(pageA.name);

        // Delete pageA in the backend
        Context.ApiHelper.PlatformGraphQlClient.DeleteItem(pageA.itemId);

        // Drag and drop pageA into pageB
        List<TreeItem> items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        Context.Browser.GetDriver().DragAndDropElement(items.Find(n => n.Name == pageA.name).Container, items.Find(n => n.Name == pageB.name).Container);

        // Check item not moved
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo($"There was an error moving the item '{pageA.name}' in the Content Tree");
        Context.Pages.Editor.WaitForNotificationToDisappear();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        items = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems();
        items.Find(i => i.Name == pageA.name).Should().BeNull();
    }
}
