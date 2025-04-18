// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using FluentAssertions.Execution;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates;

public class PartialDesignOverview : BaseFixture
{
    private const string CurrentSiteTab = "Current site";
    private const string SharedSiteTab = "Shared sites";
    private const string DetailsName = "NAME";
    private const string DetailsModified = "MODIFIED";
    private const string DetailsCreated = "CREATED";


    [Test]
    public void PartialDesignsList_ShowsBothSharedAndContextSiteDesigns()
    {
        Context.Pages.PartialDesigns.CardContainer.ActiveTab.Should().Be(CurrentSiteTab);
        Context.Pages.PartialDesigns.CardContainer.SelectSharedSiteTab();
        Context.Pages.PartialDesigns.CardContainer.ActiveTab.Should().Be(SharedSiteTab);
        Context.Pages.PartialDesigns.CardContainer.ItemCards.Count.Should().Be(2);

        Context.Pages.PartialDesigns.CardContainer.SelectCurrentSiteTab();
        Context.Pages.PartialDesigns.CardContainer.ItemCards.Count.Should().Be(2);
    }

    [Test]
    public void SharedSiteDesigns_CreateAndContextMenuOptionsAreDisabled()
    {
        Context.Pages.PartialDesigns.CardContainer.CreateButtonEnabled.Should().BeTrue();
        Context.Pages.PartialDesigns.CardContainer
            .ItemCards.Should().Contain(c => c.ActionsButtonsAvailable);

        Context.Pages.PartialDesigns.CardContainer.SelectSharedSiteTab();
        Context.Pages.PartialDesigns.CardContainer.CreateButtonEnabled.Should().BeFalse();
        Context.Pages.PartialDesigns.CardContainer
            .ItemCards.Should().NotContain(c => c.ActionsButtonsAvailable);
    }

    [Test]
    public void PartialDesignsDetails_ConsistsOfCorrectInformation()
    {
        //Create a Partial design and a folder to check information panel
        var aPartialDesign = Context.ApiHelper.PlatformGraphQlClient.GetItem(Preconditions.CreatePartialDesign("Partial Design A").path);
        var aPartialDesignFolder = Context.ApiHelper.PlatformGraphQlClient.GetItem(Preconditions.CreatePartialDesignFolder("Partial Design FolderA").path);
        Context.Pages.PartialDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
        Context.Pages.PartialDesigns.CardContainer.GetEmptyDetailsText().Should().Be("Select an item to view its details");

        Context.Pages.PartialDesigns.CardContainer.SelectItemCard(aPartialDesign.name).Should().NotBeNull();
        var detailsInfo = Context.Pages.PartialDesigns.CardContainer.GetDetailsInfo();
        using (new AssertionScope())
        {
            detailsInfo.Should()
                .Contain(DetailsName, aPartialDesign.name)
                .And.Contain(DetailsCreated, Wrappers.Helpers.GetAndFormatDateAsString(aPartialDesign.createdAt.value, Constants.DateFormatInTemplateAppDetailsInfo))
                .And.Contain(DetailsModified, Wrappers.Helpers.GetAndFormatDateAsString(aPartialDesign.updatedAt.value, Constants.DateFormatInTemplateAppDetailsInfo));
        }

        Context.Pages.PartialDesigns.CardContainer.SelectFolder(aPartialDesignFolder.name);
        detailsInfo = Context.Pages.PartialDesigns.CardContainer.GetDetailsInfo();
        using (new AssertionScope())
        {
            detailsInfo.Should()
                .Contain(DetailsName, aPartialDesignFolder.name)
                .And.Contain(DetailsCreated, Wrappers.Helpers.GetAndFormatDateAsString(aPartialDesignFolder.createdAt.value, Constants.DateFormatInTemplateAppDetailsInfo))
                .And.Contain(DetailsModified, Wrappers.Helpers.GetAndFormatDateAsString(aPartialDesignFolder.updatedAt.value, Constants.DateFormatInTemplateAppDetailsInfo));
        }
    }

    [Test]
    public void PartialDesignsAndFolders_AreSortedAlphabetically()
    {
        //Create Partial design and folders to check sorting
        Preconditions.CreatePartialDesign("Goose");
        Preconditions.CreatePartialDesignFolder("Partial Design FolderA");
        Preconditions.CreatePartialDesignFolder("A Partial Design Folder");
        Context.Pages.PartialDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

        using (new AssertionScope())
        {
            Context.Pages.PartialDesigns.CardContainer.GetFolderTitles().Should().BeInAscendingOrder();
            Context.Pages.PartialDesigns.CardContainer.ItemCards.Select(i => i.Title).ToList().Should().BeInAscendingOrder();
        }
    }

    [Test]
    public void PartialFoldersAndDesigns_AbleToNavigateThroughBreadcrumbs()
    {
        //Create Partial design,folder and child folders to navigation
        var topLevelFolder = Preconditions.CreatePartialDesignFolder("Top level folder");
        var childFolder = Preconditions.CreatePartialDesignFolder("Child folder", parentId: Context.TestItems["Top level folder"].itemId);
        var partialDesign = Preconditions.CreatePartialDesign("Partial DesignA", parentId: Context.TestItems["Child folder"].itemId);
        Context.Pages.PartialDesigns.CardContainer
            .SelectSharedSiteTab()
            .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

        //Navigate to inner most folder
        Context.Pages.PartialDesigns.CardContainer.SelectFolder(topLevelFolder.name);
        Context.Pages.PartialDesigns.CardContainer.SelectFolder(childFolder.name);
        Context.Pages.PartialDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(3);
        Context.Pages.PartialDesigns.CardContainer.ItemCards.Should().Contain(i => i.Title.Equals(partialDesign.name));

        //Go one level up in folders
        Context.Pages.PartialDesigns.CardContainer.NavigateToLinkInBreadcrumbs(topLevelFolder.name);
        Context.Pages.PartialDesigns.CardContainer.GetFolderTitles().Should().Contain(childFolder.name);
        Context.Pages.PartialDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(2);
        Context.Pages.PartialDesigns.CardContainer.IsItemCardPresent().Should().BeFalse();

        //Go out of Partial design view and comes back breadcrumbs must be reset-ted.
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
        Context.Pages.PartialDesigns.CardContainer.GetNumberOfBreadcrumbs().Should().Be(0);
    }

    [Test]
    public void PartialDesignOverviewWithoutSharedDesigns_SharedTabIsNotVisible()
    {
        try
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.EmptySite);
            Context.Pages.PartialDesigns.CardContainer.TabsVisible.Should().BeFalse();
        }
        finally
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        }
    }

    [OneTimeSetUp]
    public void OpenPartialDesigns()
    {
        Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
        Context.Pages.TopBar.AppNavigation.OpenTemplates();
        Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
    }
}
