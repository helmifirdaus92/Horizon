// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class SearchPageDesigns : BaseFixture
    {
        public static readonly string PageDesignFolderA = "PageDesignFolder A";
        public static readonly string PageDesignFolderB = "PageDesignFolder B";
        public static readonly string PageDesignFolderC = "PageDesignFolderC";
        public static readonly string PageDesignA = "PageDesign A";
        public static readonly string PageDesignB = "PageDesignB";
        public static readonly string SharedPageDesign = "SharedPageDesign";

        [Test]
        public void UserStartsTyping_ValidItemNamesInTheSearchBar_AppropriateResultsAppears()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            WaitForSearchIndex_PageDesigns_ToBeIndexed();
            cardContainer.Search("PageDesignFolder");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PageDesignFolderA, PageDesignFolderB, PageDesignFolderC)
                .And.HaveCount(3)
                .And.BeInAscendingOrder();
            cardContainer.Search("PageDesign");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PageDesignA, PageDesignB, PageDesignFolderA, PageDesignFolderB, PageDesignFolderC)
                .And.HaveCount(6);
            cardContainer.Search("PageDesign A");
            cardContainer.GetSearchResults().ListOfItems().Should().HaveCount(8);
            cardContainer.Search("PageDesignB");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PageDesignB).And.HaveCount(1);
            cardContainer.Search("b");
            cardContainer.GetSearchResults().ListOfItems().Should().ContainInOrder(PageDesignFolderB, PageDesignB);
            cardContainer.Search("a");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PageDesignFolderC).And.HaveCount(8);
            Context.Pages.PartialDesigns.CardContainer.ClearResultsAndCloseOverlay();
        }

        [Test]
        public void UserStartsTyping_InvalidItemNamesInTheSearchBar_NoSearchResults()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            WaitForSearchIndex_PageDesigns_ToBeIndexed();
            cardContainer.Search("X");
            cardContainer.GetSearchResults().IsEmptyContainerDisplayed().Should().BeTrue();
            cardContainer.GetSearchResults().EmptyContainerTitle.Should().Be("No search results");
            cardContainer.GetSearchResults().EmptyContainerDescription.Should().Be("Try a different search query");
            Context.Pages.PartialDesigns.CardContainer.ClearResultsAndCloseOverlay();

            // TODO add cases with space and special chars after fix https://sitecore.atlassian.net/browse/PGS-1791
        }

        [Test]
        public void UserSearch_AndClickTheFolderInSearchResults_FolderIsOpened()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            cardContainer.Search("PageDesignFolder");
            cardContainer.GetSearchResults().ClickOnResult("PageDesignFolder B");

            cardContainer.GetBreadCrumbs().Should().Contain(PageDesignFolderB);
            cardContainer.GetNumberOfBreadcrumbs().Should().Be(2);
        }

        [Test]
        public void UserSearch_AndClickThePageDesignInSearchResults_FolderWithPageDesignIsOpened()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            cardContainer.Search("PageDesign");
            cardContainer.GetSearchResults().ClickOnResult(PageDesignB);

            cardContainer.GetBreadCrumbs().Should().Contain(PageDesignFolderA).And.Contain(PageDesignFolderC);
            cardContainer.GetNumberOfBreadcrumbs().Should().Be(3);

            cardContainer.GetDetailsInfo().Should().Contain("NAME", PageDesignB);
            Context.Pages.PageDesigns.PageDesignByName(PageDesignB).HasSelectedState.Should().BeTrue();
        }

        [Test]
        public void UserSelectsASharedPageDesignFromResults_SharedTabIsOpened()
        {
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            cardContainer.Search("PageDesign");
            cardContainer.GetSearchResults().ClickOnResult(SharedPageDesign);

            cardContainer.ActiveTab.Should().Be("Shared sites");
            cardContainer.GetDetailsInfo().Should().Contain("NAME", SharedPageDesign);
            Context.Pages.PageDesigns.PageDesignByName(SharedPageDesign).HasSelectedState.Should().BeTrue();
        }

        [OneTimeSetUp]
        public void CreateTestDataAndOpenPageDesigns()
        {
            CreateTestData_SearchPageDesigns();
            WaitForSearchIndex_PageDesigns_ToBeIndexed();
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        }

        [OneTimeTearDown]
        public void CleanUpTestDataAfterAllTests()
        {
            Context.ApiHelper.CleanTestData(keepProtected: false);
        }

        private void CreateTestData_SearchPageDesigns()
        {
            // create folder PageDesignFolder A
            Preconditions.CreatePageDesignFolder(PageDesignFolderA, doNotDelete: true);

            // create folder PageDesignFolder B
            Preconditions.CreatePageDesignFolder(PageDesignFolderB, doNotDelete: true);

            // create folder PageDesignFolderC
            Preconditions.CreatePageDesignFolder(PageDesignFolderC, Context.TestItems[PageDesignFolderA].itemId, doNotDelete: true);

            // create PageDesign A in PageDesignFolderB
            Preconditions.CreatePageDesign(PageDesignA, Context.TestItems[PageDesignFolderB].itemId, doNotDelete: true);

            // create PageDesignB in PageDesignFolder C
            Preconditions.CreatePageDesign(PageDesignB, Context.TestItems[PageDesignFolderC].itemId, doNotDelete: true);

            // create a shared PageDesign
            Preconditions.CreatePageDesign(SharedPageDesign, shared: true, doNotDelete: true);
        }

        private void WaitForSearchIndex_PageDesigns_ToBeIndexed()
        {
            Preconditions.WaitForItemToBeIndexed(Constants.PageDesignsPath, "p", 3);
        }
    }
}
