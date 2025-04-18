// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.General.PageSettings;

public class PageDesign : BaseFixture
{
    private Item _testPage;

    [SetUp]
    public void CreatePageAndOpenSettings()
    {
        _testPage = Preconditions.CreateAndOpenPage();
    }

    [Test]
    public void CheckPageDesignTab()
    {
        //open Settings and Page Design
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        PageDesignInfo pageDesign = pageDetails.GetPageDesignTab();
        pageDesign.Expand();
        pageDetails.ScrollToViewPageDesign();

        pageDesign.RestoreToDefault.Click();
        pageDesign.ChangePageDesign.Displayed.Should().BeTrue();
        pageDesign.ChangePageDesign.Click();
        pageDesign.SelectedVariant.Text.Should().BeEquivalentTo("Default");
        pageDesign.SelectedVariant.Click();
        pageDesign.SaveButton.Enabled.Should().BeFalse();
        pageDesign.CancelButton.Click();

        Context.Pages.Editor.PageDetails.Close();
        Context.Pages.Editor.OverlayContainer.Displayed.Should().BeFalse();
    }

    [Test]
    public void ChangePageDesign()
    {
        string pageDesignName = "Test page design";

        // create another test page
        Item secondPage = Preconditions.CreatePage(parentId: _testPage.itemId);

        // Create new page design
        Preconditions.CreatePageDesign(pageDesignName, Constants.PageDesignsItemId);

        //open Settings and Page Design
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        PageDesignInfo pageDesign = pageDetails.GetPageDesignTab();
        pageDesign.Expand();
        pageDetails.ScrollToViewPageDesign();

        // change page design
        pageDesign.RestoreToDefault.Click();
        pageDesign.ChangePageDesign.Click();
        var pageDesignVariant = pageDesign.PageDesignVariants.Find(i => i.Text == pageDesignName);
        pageDesignVariant.Click();
        pageDesign.SaveButton.Click();
        pageDesign.ConfirmChangesButton.Click();

        pageDesign.RestoreToDefault.Enabled.Should().BeTrue();

        Context.Pages.Editor.PageDetails.Close();

        // check child page page design not being changed
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Collapse();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Expand();
        Context.Pages.Editor.LeftHandPanel.SelectPage(secondPage.name);

        var item = Context.Pages.Editor.LeftHandPanel.OpenSiteTree().SelectedItem;
        item.InvokeContextMenu().SelectOption(ContextMenu.ContextMenuButtons.Settings);
        pageDesign = Context.Pages.Editor.PageDetails.GetPageDesignTab();
        Context.Pages.Editor.OverlayContainer.Displayed.Should().BeTrue();
        Context.Pages.Editor.PageDetails.Close();
    }

    [Test]
    public void CannotChangePageDesignWithoutWriteRights()
    {
        // Forbid write for test page
        Context.ApiHelper.PlatformGraphQlClient.DenyWriteAccess(_testPage.itemId, TestRunSettings.UserEmail);
        Context.Browser.Refresh();

        //open Settings and Page Design
        PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
            .InvokeContextMenu().InvokePageDetailsDialog();

        //pageDesign.ChangePageDesignButton.Enabled.Should().BeFalse();

        InsertOptions insertOptions = pageDetails.GetInsertOptionsTab();

        //InsertOptions insertOptions = Context.Pages.Editor.PageDetails.GetInsertOptionsTab();
        insertOptions.InsertOptionsCheckbox.GetAttribute("class").Should().Contain("disabled");
        pageDetails.Close();

        //Context.Pages.Editor.PageDetails.Close();
    }
}
