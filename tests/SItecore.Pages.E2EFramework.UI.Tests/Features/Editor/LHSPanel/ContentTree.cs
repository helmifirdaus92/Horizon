// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LHSPanel;

public class ContentTree : BaseFixture
{
    private readonly string _displayNameFieldName = "__Display name";
    private readonly string _danishDisplayName = "Page DA version";
    private readonly string _headlessLayout = "/sitecore/layout/Layouts/Foundation/JSS Experience Accelerator/Presentation/JSS Layout";
    private readonly string _layoutProjectFolder = "/sitecore/layout/Layouts/Project";

    [SetUp]
    public void SetLanguage()
    {
        Preconditions.SelectPageByNameFromSiteTree("Home");
        // Set Site to test site
        Preconditions.OpenSXAHeadlessSite();

        // Set language to default
        Preconditions.OpenEnglishLanguage();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    /*
     * In content tree only Items with Presentation are visible with only exception being folders
     * Even if the Item has a sub item with presentation.
     */
    [Test]
    public void ItemsInContentTree_OnlyPagesWithPresentationAndFoldersAreVisible()
    {
        Item pageA = Preconditions.CreatePage("PageA");
        Preconditions.CreateFolder("FolderA");
        Item stdTemplate = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/templates/System/Templates/Standard template");
        Item folderTemplate = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/templates/Common/Folder");
        Item customFolderTemplate = Preconditions.CreateTemplate("folderTemplate", "{1930BBEB-7805-471A-A3BE-4858AC7CF696}", new List<string>
        {
            folderTemplate.itemId
        });
        Item siteHome = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.HomePagePath);
        Preconditions.CreateItem("CustomFolder", siteHome.itemId, customFolderTemplate.itemId);
        Item pageWithNoPresentation = Preconditions.CreatePage("PageWithNoPresentation", templateId: stdTemplate.itemId);
        Preconditions.CreatePage("SubPageWithPresentation", parentId: pageWithNoPresentation.itemId);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
            .Should().Contain("PageA")
            .And.Contain("FolderA")
            .And.Contain("CustomFolder")
            .And.NotContain("SubPageWithPresentation")
            .And.NotContain("PageWithNoPresentation");
    }

    /*
     * Items are displayed with only either of shared or final layout are available
     * Achieved manipulating values in fields __Final Renderings (Final layout) & __Renderings (Shared layout)
     */
    [Test]
    public void ItemsInContentTree_PagesWithOnlySharedOrFinalLayout()
    {
        Item pageWithFinalLayoutOnly = Preconditions.CreatePage("PageWithFinalLayoutOnly");
        Item pageWithSharedLayoutOnly = Preconditions.CreatePage("PageWithSharedLayoutOnly");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageWithFinalLayoutOnly.itemId, "__Final Renderings", "", version: 1);
        string finalLayout = Context.ApiHelper.PlatformGraphQlClient.GetItemFieldValue(pageWithSharedLayoutOnly.path, "__Renderings");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageWithSharedLayoutOnly.itemId, "__Renderings", "");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageWithSharedLayoutOnly.itemId, "__Final Renderings", finalLayout, version: 1);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
            .Should().Contain("PageWithFinalLayoutOnly")
            .And.Contain("PageWithSharedLayoutOnly");
    }

    /*
     * Expanding nodes in Tree, only first level items are displayed.
     *
     * When an inner node Item is accessed via Url, tree is expanded upt to the nested Item from root.
     */
    [Test]
    public void NestedTreeItems_TreeNodesAreExpandedAccordingly()
    {
        Item folderA = Preconditions.CreateFolder("FolderA");
        Item childPageA = Preconditions.CreatePage("ChildPageA", parentId: folderA.itemId);
        Item nestedChildPage = Preconditions.CreatePage("NestedChildPage", parentId: childPageA.itemId);
        Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(nestedChildPage.path, "da");
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(nestedChildPage.itemId, _displayNameFieldName, _danishDisplayName, "da");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(folderA.name).Expand();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
            .Should().Contain("FolderA")
            .And.Contain("ChildPageA")
            .And.NotContain("NestedChildPage");

        Context.Pages.Editor.Open(nestedChildPage.itemId, "da", Constants.SXAHeadlessSite, tenantName: Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
            .Should().Contain("FolderA")
            .And.Contain("ChildPageA")
            .And.NotContain("NestedChildPage")
            .And.Contain(_danishDisplayName);
    }

    /*
     * Expand and collapse LHS panel
     */
    [Test]
    public void LeftHandPanel_IsCollapsible()
    {
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.Collapse();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.IsExpanded.Should().BeFalse("panel should be collapsed");
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.Expand();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.IsExpanded.Should().BeTrue("panel should be expanded");
    }

    /*
     * Large no of items in the tree and Left hand side displays all items
     * and content menu is fully visible in the existing view.
     */
    [Test]
    public void ContentTreeWithLargeNoOfItems_scrollableAndContextMenuVisibleToo()
    {
        Preconditions.CreateMultiplePages("EightyPagesTest", 80);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        TreeItem firstPage = Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem;
        Rectangle firstItemRectangle = firstPage.GetElementRectangle();
        ContextMenu contextMenu = firstPage.InvokeContextMenu();
        this.WaitForCondition(c => contextMenu.Rectangle.Left == firstItemRectangle.Right, TimeSpan.FromSeconds(1));
        contextMenu.Rectangle.Left.Should().BeInRange(firstItemRectangle.Right - 2, firstItemRectangle.Right + 2);
        contextMenu.Rectangle.Top.Should().BeInRange(firstItemRectangle.Top - 2, firstItemRectangle.Top + 2);
        contextMenu.Container.ClickOutside(x:200);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.ScrollToLastElement();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Count.Should().BeGreaterOrEqualTo(27);
        TreeItem lastPage = Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Last();
        lastPage.Hover();
        contextMenu = lastPage.InvokeContextMenu();
        Rectangle leftPanelRectangle = Context.Pages.Editor.LeftPanelRectangle;
        Rectangle lastPageRectangle = lastPage.GetElementRectangle();
        this.WaitForCondition(c => contextMenu.Rectangle.Left == lastPageRectangle.Right, TimeSpan.FromSeconds(1));
        Rectangle contextMenuRectangle = contextMenu.Rectangle;
        contextMenuRectangle.Left.Should().BeInRange(lastPageRectangle.Right - 2, lastPageRectangle.Right + 2);
        contextMenuRectangle.Bottom.Should().BeInRange(leftPanelRectangle.Bottom - 10, leftPanelRectangle.Bottom + 10);
        contextMenu.Container.ClickOutside(x:200);
    }

    /*
     * Items with no read access for the user does not appear in tree
     */
    [Test]
    public void ContentTreeItems_OnlyItemsWithReadAccessAreDisplayed()
    {
        Item pageWithNoReadAccess = Preconditions.CreatePage("PageWithNoReadAccess");
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(pageWithNoReadAccess.itemId, TestRunSettings.UserEmail);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
            .Should().NotContain("PageWithNoReadAccess");
    }

    /*
     * Pages with broken Item links
     */
    [Test]
    public void PageWithBrokenItems_DisplayedAppropriately()
    {
        try
        {
            Item pageWithNonExistentLayoutItem = Preconditions.CreatePage("PageWithNonExistentLayoutItem");
            Item pageWithNonExistentLayoutFile = Preconditions.CreatePage("PageWithNonExistentLayoutFile");

            Item headlessLayoutItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(_headlessLayout);
            Item layoutsProjectFolderItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(_layoutProjectFolder);
            Item nonExistentLayoutItem = Context.ApiHelper.PlatformGraphQlClient.CopyItem("NonExistentLayoutItem", headlessLayoutItem.itemId, layoutsProjectFolderItem.itemId);
            TestData.Items.Add(nonExistentLayoutItem);
            Item nonExistentLayoutFile = Preconditions.CreateItem("NonExistentLayoutFile", layoutsProjectFolderItem.itemId, "{E4E11508-04A4-4B0B-A263-5201F811C9CD}");

            Context.ApiHelper.PlatformGraphQlClient.UpdateLayoutId(pageWithNonExistentLayoutItem.itemId, nonExistentLayoutItem.itemId, false);
            Context.ApiHelper.PlatformGraphQlClient.UpdateLayoutId(pageWithNonExistentLayoutFile.itemId, nonExistentLayoutFile.itemId, false);
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(nonExistentLayoutItem.itemId);
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetAllVisibleItems().Select(item => item.Name)
                .Should().NotContain("PageWithNonExistentLayoutItem")
                .And.Contain("PageWithNonExistentLayoutFile");
        }
        finally
        {
            /*
             * Items has to be deleted in sequence so that the layout file and layout item does not throw broken link errors
             */
            Context.ApiHelper.CleanTestData();
        }
    }
}
