// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor;

public class SearchComponents : BaseFixture
{
    [OneTimeSetUp]
    public void OpenSxaSite()
    {
        Preconditions.OpenSXAHeadlessSite();
    }

    [SetUp]
    public void OpenComponentsTab()
    {
        /*
         * Reset LHS and open search before every test method.
         */
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    /*
     * Search results are shown as soon as the user starts typing
     */
    [Test]
    public void UserStartsTyping_SearchResultsAreUpdated()
    {
        OpenSearchInLhsComponentsTab();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.Clear();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("r");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups.Count.Should().Be(2);

        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("ich");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups[0].Name.Should().Be("Page Content");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups[0].ComponentCards.Count.Should().Be(1);
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups[0].ComponentCards.ToList()[0].Text.Should().Be("Rich Text");
    }

    /*
     * Search results must be a super set of matching group names and individual components
     */
    [Test]
    public void SearchResults_GroupsAndComponentsAreDisplayed()
    {
        OpenSearchInLhsComponentsTab();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("Page");
        var groups = Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups;
        groups.Count.Should().Be(3);
        groups.Select(g => g.Name).ToList().Should().Contain("Page Content").And.Contain("Page Structure");
        groups.First(g => g.Name.Equals("Page Structure")).ComponentCards.Count.Should().Be(3);
        groups.First(g => g.Name.Equals("Page Content")).ComponentCards.Count.Should().Be(4);

        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.Clear();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("Con");
        groups = Context.Pages.Editor.LeftHandPanel.ComponentGallery.ComponentGroups;
        groups.Count.Should().Be(3);
        groups.Select(g => g.Name).ToList().Should().Contain("Page Content").And.Contain("Page Structure");
        groups.First(g => g.Name.Equals("Page Content")).ComponentCards.Count.Should().Be(4);
        groups.First(g => g.Name.Equals("Page Structure")).ComponentCards.Count.Should().Be(1);
        groups.First(g => g.Name.Equals("Page Structure")).ComponentCards.ToList()[0].Text.Should().Be("Container");
    }

    /*
     * Empty results view on unavailable items
     */
    [Test]
    public void SearchWithUnavailableItemName_ShowsEmptyResultsView()
    {
        OpenSearchInLhsComponentsTab();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("yx");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.NoResults.Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.NoResultsText.Should()
            .Contain("No search results")
            .And.Contain("Try a different search query");
    }

    /*
     * Search with special characters should behave the same as unavailable items
     */
    [Test]
    public void SearchWithSpecialCharacters_GivesEmptyResultsView()
    {
        OpenSearchInLhsComponentsTab();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.InputBox.SendKeys("&#%");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.NoResults.Should().BeTrue();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.NoResultsText.Should()
            .Contain("No search results")
            .And.Contain("Try a different search query");
    }

    /*
     * Filter options are available only for Sitecore Components (not SXA)
     * Since TC tests have FeAAS disabled, this scenario to be covered in tests in GitHub Action.
     */
    [Test]
    public void FilterMenu_DisplaysSearchLimitationText()
    {
        OpenSearchInLhsComponentsTab();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.OpenFilters();
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.FilterLimitationText
            .Should().Be("*Data source filter only applies to Sitecore Components");
        Context.Pages.Editor.LeftHandPanel.ComponentGallery.FilterMenu.Close();
    }

    /*
     * Component search should also be working in personalize.
     * Search results must a subset from the list of compatible components.
     */
    [Test]
    public void ComponentSearchInPersonalizationRHS_SearchResultsUpdatedWithCompatibleList()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            RenderingId(SxaRenderings.RichText),
            "Compatible Renderings",
            RenderingId(SxaRenderings.Title) + "|" + RenderingId(SxaRenderings.Image));

        var testPage = Preconditions.CreatePage("Page A");
        Preconditions.AddComponent(testPage.itemId, testPage.path, RenderingId(SxaRenderings.RichText));
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SelectPage(testPage.name);

        Context.Pages.TopBar.AppNavigation.OpenPersonalizationPanel();
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.SelectVariantByName("Visitor from Copenhagen");
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();
        Context.Pages.Personalize.CurrentPage.GetRenderingByName("Rich Text").Select();
        Context.Pages.Personalize.TimedNotification.Button.Click();

        Context.Pages.Personalize.RightHandPanel.Personalization.OpenComponentsPanel();
        var gallery = Context.Pages.Personalize.RightHandPanel.Personalization.ComponentsPanel.Gallery;
        gallery.InputBox.SendKeys("Title");
        gallery.ComponentGroups.Count.Should().Be(1);
        gallery.ComponentGroups[0].Name.Should().Be("Page Content");
        gallery.ComponentGroups[0].ComponentCards.Count.Should().Be(1);
        gallery.ComponentGroups[0].ComponentCards.ToList()[0].Text.Should().Be("Title");

        //TODO remove as part of Speed Optimization fixes
        //This is a work around for canvas to not reload at in Setup method, as it breaks the canvas with Speed Optimization.
        Context.Pages.Editor.LeftHandPanel.PersonalizationPanel.SelectVariantByName("Default");
        Context.Pages.Personalize.WaitForNewPageInCanvasLoaded();
    }

    /*
     * Components search should work in canvas for empty placeholders.
     */
    [Test]
    public void ComponentSearchInCanvas_SearchResultsUpdatedWithAppropriateResults()
    {
        Preconditions.CreateAndOpenPage("Page A");
        Context.Pages.Editor.CurrentPage.EmptyPlaceholders[0].AddComponentButton.Click();

        var gallery = Context.Pages.Editor.ComponentGalleryDialogPanel.ComponentsGallery;
        gallery.InputBox.SendKeys("Image");
        gallery.ComponentGroups.Count.Should().Be(1);
        gallery.ComponentGroups[0].Name.Should().Be("Media");
        gallery.ComponentGroups[0].ComponentCards.Count.Should().Be(1);
        gallery.ComponentGroups[0].ComponentCards.ToList()[0].Text.Should().Be("Image");
        Context.Pages.Editor.ComponentGalleryDialogPanel.Close();
    }

    [OneTimeTearDown]
    public void ResetCompatibleRenderings()
    {
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
            RenderingId(SxaRenderings.RichText),
            "Compatible Renderings",
            "");
    }

    private static void OpenSearchInLhsComponentsTab()
    {
        Context.Pages.Editor.LeftHandPanel.OpenComponentsTab();
    }
}
