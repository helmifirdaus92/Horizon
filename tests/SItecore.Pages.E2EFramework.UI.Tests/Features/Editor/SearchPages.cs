// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor;

public class SearchPages : BaseFixture
{
    private Item _pageWithNoReadAccess;

    [OneTimeSetUp]
    public void CreateTestItems()
    {
        /*
         * Create test Items
         * A page 'PageWithNoReadAccess': To check the item which user does not have read access to, does not appear in search results.
         * A page 'PageUnderHome' and a folder 'FolderUnderHome': To check filter options in search query.         *
         */
        _pageWithNoReadAccess = Preconditions.CreatePage("PageWithNoReadAccess", doNotDelete: true);
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(_pageWithNoReadAccess.itemId, TestRunSettings.UserEmail);
        Preconditions.CreateFolder("FolderUnderHome", doNotDelete: true);

        var testPage = Preconditions.CreatePage("PageUnderHome", doNotDelete: true);

        Preconditions.WaitForItemToBeIndexed(Constants.HomePagePath, "Page", 2);
        Preconditions.WaitForItemToBeIndexed(Constants.HomePagePath, "Folder");

        Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
        Preconditions.OpenSXAHeadlessSite();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Preconditions.SelectPageByNameFromSiteTree("Home");
    }

    [SetUp]
    public void OpenSearchInLhs()
    {
        /*
         * Reset LHS and open search before every test method.
         */
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        if (!Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Equals("Home"))
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").Select();
        }

        Context.Pages.Editor.LeftHandPanel.ClickOnSearch();
    }

    /*
     * Checks search results are updated when user starts typing.
     */
    [Test]
    public void UserStartsTyping_SearchResultsAreUpdated()
    {
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.OpenFilters().CheckedOption.Should().Be(FilterMenu.Options.All);
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.FilterMenu.Close();

        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("H");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();

        var searchResults = Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResults;
        searchResults.Should().HaveCountGreaterOrEqualTo(3)
            .And.Contain("Home")
            .And.Contain("FolderUnderHome")
            .And.Contain("PageUnderHome")
            .And.BeInAscendingOrder();
        searchResults.Any(r => !r.ToUpper().Contains('H')).Should().BeFalse();
        /*
         * Item with no presentation is disabled in view
         */
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResultsTree.GetItemByPath("FolderUnderHome").IsDisabled.Should().BeTrue();

        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.Clear();

        /*
         * User results should not show the item ('PageWithNoReadAccess') that user does not have read access to.
         */
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("No");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.NoResults.Should().BeTrue();
    }

    /*
     * When user types special characters, a No result view should be displayed.
     * TODO to un-ignore after bug fix
     */
    [Test]
    [Ignore("https://sitecore.atlassian.net/browse/PGS-1791")]
    public void SearchWithSpecialCharacters_GivesEmptyResultsView()
    {
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("&#%");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.NoResults.Should().BeTrue();
    }

    /*
     * Empty results view displayed up on no result from search query.
     */
    [Test]
    public void UserStartsTypingWithUnavailableItemName_ShowsEmptyResultsView()
    {
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("XYZ");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.NoResults.Should().BeTrue();
    }

    /*
     * Filter options in pages search view.
     *  1.All
     *  2.Pages only
     *  3.Folders only
     */
    [Test]
    public void FiltersInSearchPanel_ResultsAreDisplayedAppropriately()
    {
        //Pages only
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.OpenFilters()
            .SelectOption(FilterMenu.Options.Pages);
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.FilterMenu.Close();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("H");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();
        var searchResults = Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResults;
        searchResults.Should().HaveCountGreaterOrEqualTo(2)
            .And.Contain("Home")
            .And.Contain("PageUnderHome");
        searchResults.Any(r => !r.ToUpper().Contains('H')).Should().BeFalse();


        //Folders only
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.OpenFilters()
            .SelectOption(FilterMenu.Options.Folders);
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.FilterMenu.Close();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResults
            .Should().HaveCount(1)
            .And.Contain("FolderUnderHome");

        //All items
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.OpenFilters()
            .SelectOption(FilterMenu.Options.All);
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.FilterMenu.Close();
        searchResults = Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResults;
        searchResults.Should().HaveCountGreaterOrEqualTo(3)
            .And.Contain("Home")
            .And.Contain("FolderUnderHome")
            .And.Contain("PageUnderHome")
            .And.BeInAscendingOrder();
        searchResults.Any(r => !r.ToUpper().Contains('H')).Should().BeFalse();
    }

    /*
     * When user clicks on a search result canvas is updated.
     * Upon returning to site tree the page is selected in tree.
     */
    [Test]
    public void SelectSearchResult_CanvasIsUpdated()
    {
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.InputBox.SendKeys("Page");
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.WaitForResults();
        Context.Pages.Editor.LeftHandPanel.SearchResultsPanel.SearchResultsTree.GetItemByPath("PageUnderHome").Select();
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text.Should().Be("PageUnderHome");

        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be("PageUnderHome");
    }
}
