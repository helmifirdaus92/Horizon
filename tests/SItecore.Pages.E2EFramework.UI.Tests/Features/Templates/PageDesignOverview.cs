// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates;

public class PageDesignOverview : BaseFixture
{
    private const string CurrentSiteTab = "Current site";
    private const string SharedSiteTab = "Shared sites";
    private const string DetailsName = "NAME";
    private const string DetailsModified = "MODIFIED";
    private const string DetailsCreated = "CREATED";

    [Test]
    public void PageDesignsList_ShowsBothSharedAndContextSiteDesigns()
    {
        Context.Pages.PageDesigns.CardContainer.ActiveTab.Should().Be(CurrentSiteTab);
        Context.Pages.PageDesigns.CardContainer.SelectSharedSiteTab();
        Context.Pages.PageDesigns.CardContainer.ActiveTab.Should().Be(SharedSiteTab);
        Context.Pages.PageDesigns.CardContainer.ItemCards.Count.Should().Be(1);

        Context.Pages.PageDesigns.CardContainer.SelectCurrentSiteTab();
        Context.Pages.PageDesigns.CardContainer.ItemCards.Count.Should().Be(1);
    }

    [Test]
    public void SharedSiteDesigns_CreateAndContextMenuOptionsAreDisabled()
    {
        Context.Pages.PageDesigns.CardContainer.CreateButtonEnabled.Should().BeTrue();
        Context.Pages.PageDesigns.CardContainer
            .ItemCards.Should().Contain(c => c.ActionsButtonsAvailable);

        Context.Pages.PageDesigns.CardContainer.SelectSharedSiteTab();
        Context.Pages.PageDesigns.CardContainer.CreateButtonEnabled.Should().BeFalse();
        Context.Pages.PageDesigns.CardContainer
            .ItemCards.Should().NotContain(c => c.ActionsButtonsAvailable);
    }

    [Test]
    public void PageDesignsDetails_ConsistsOfCorrectInformation()
    {
        //Create a Page design and a folder to check information panel
        var aPageDesign = Context.ApiHelper.PlatformGraphQlClient.GetItem(Preconditions.CreatePageDesign("Page Design A").path);
        var aPageDesignFolder = Context.ApiHelper.PlatformGraphQlClient.GetItem(Preconditions.CreatePageDesignFolder("Page Design FolderA").path);
        Context.Pages.PageDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
        Context.Pages.PageDesigns.CardContainer.GetEmptyDetailsText().Should().Be("Select an item to view its details");

        Context.Pages.PageDesigns.CardContainer.SelectItemCard(aPageDesign.name).Should().NotBeNull();
        var detailsInfo = Context.Pages.PageDesigns.CardContainer.GetDetailsInfo();
        using (new AssertionScope())
        {
            detailsInfo.Should()
                .Contain(DetailsName, aPageDesign.name)
                .And.Contain(DetailsCreated, Wrappers.Helpers.GetAndFormatDateAsString(aPageDesign.createdAt.value, Constants.DateFormatInTemplateAppDetailsInfo))
                .And.Contain(DetailsModified, Wrappers.Helpers.GetAndFormatDateAsString(aPageDesign.updatedAt.value, Constants.DateFormatInTemplateAppDetailsInfo));
        }

        Context.Pages.PageDesigns.CardContainer.SelectFolder(aPageDesignFolder.name);
        detailsInfo = Context.Pages.PageDesigns.CardContainer.GetDetailsInfo();
        using (new AssertionScope())
        {
            detailsInfo.Should()
                .Contain(DetailsName, aPageDesignFolder.name)
                .And.Contain(DetailsCreated, Wrappers.Helpers.GetAndFormatDateAsString(aPageDesignFolder.createdAt.value, Constants.DateFormatInTemplateAppDetailsInfo))
                .And.Contain(DetailsModified, Wrappers.Helpers.GetAndFormatDateAsString(aPageDesignFolder.updatedAt.value, Constants.DateFormatInTemplateAppDetailsInfo));
        }
    }

    [Test]
    public void PageDesignsAndFolders_AreSortedAlphabetically()
    {
        //Create Page design and folders to check sorting
        Preconditions.CreatePageDesign("Goose");
        Preconditions.CreatePageDesignFolder("Page Design FolderA");
        Preconditions.CreatePageDesignFolder("A Page Design Folder");
        Context.Pages.PageDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

        using (new AssertionScope())
        {
            Context.Pages.PageDesigns.CardContainer.GetFolderTitles().Should().BeInAscendingOrder();
            Context.Pages.PageDesigns.CardContainer.ItemCards.Select(i => i.Title).ToList().Should().BeInAscendingOrder();
        }
    }

    [Test]
    public void PageFoldersAndDesigns_AbleToNavigateThroughBreadcrumbs()
    {
        //Create Page design,folder and child folders to navigation
        var topLevelFolder = Preconditions.CreatePageDesignFolder("Top level folder");
        var childFolder = Preconditions.CreatePageDesignFolder("Child folder", parentId: Context.TestItems["Top level folder"].itemId);
        var pageDesign = Preconditions.CreatePageDesign("Page DesignA", parentId: Context.TestItems["Child folder"].itemId);
        Context.Pages.PageDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

        //Navigate to inner most folder
        Context.Pages.PageDesigns.CardContainer.SelectFolder(topLevelFolder.name);
        Context.Pages.PageDesigns.CardContainer.SelectFolder(childFolder.name);
        Context.Pages.PageDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(3);
        Context.Pages.PageDesigns.CardContainer.ItemCards.Should().Contain(i => i.Title.Equals(pageDesign.name));

        //Go one level up in folders
        Context.Pages.PageDesigns.CardContainer.NavigateToLinkInBreadcrumbs(topLevelFolder.name);
        Context.Pages.PageDesigns.CardContainer.GetFolderTitles().Should().Contain(childFolder.name);
        Context.Pages.PageDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(2);
        Context.Pages.PageDesigns.CardContainer.IsItemCardPresent().Should().BeFalse();

        //Go out of Page design view and comes back breadcrumbs must be reset-ted.
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        Context.Pages.PageDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(0);
    }

    [Test]
    public void PageDesignOverviewWithoutSharedDesigns_SharedTabIsNotVisible()
    {
        try
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.EmptySite);
            Context.Pages.PageDesigns.CardContainer.TabsVisible.Should().BeFalse();
        }
        finally
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        }
    }

    [OneTimeSetUp]
    public void OpenPageDesigns()
    {
        Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        Context.Pages.TopBar.AppNavigation.OpenTemplates();
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
    }
}
