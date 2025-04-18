// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class SearchPartialDesigns : BaseFixture
    {
        public static readonly string PartialDesignFolderA = "PartialDesignFolder A";
        public static readonly string PartialDesignFolderB = "PartialDesignFolder B";
        public static readonly string PartialDesignFolderC = "PartialDesignFolderC";
        public static readonly string PartialDesignA = "PartialDesign A";
        public static readonly string PartialDesignB = "PartialDesignB";
        public static readonly string SharedPartialDesign = "SharedPartialDesign";


        [Test]
        public void UserStartsTyping_ValidItemNamesInTheSearchBar_AppropriateResultsAppears()
        {
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            cardContainer.Search("PartialDesignFolder");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PartialDesignFolderA, PartialDesignFolderB, PartialDesignFolderC)
                .And.HaveCount(3)
                .And.BeInAscendingOrder();
            cardContainer.Search("PartialDesign");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PartialDesignA, PartialDesignB, PartialDesignFolderA, PartialDesignFolderB, PartialDesignFolderC)
                .And.HaveCount(6);
            cardContainer.Search("PartialDesign A");
            cardContainer.GetSearchResults().ListOfItems().Should().HaveCount(8);
            cardContainer.Search("PartialDesignB");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PartialDesignB).And.HaveCount(1);
            cardContainer.Search("b");
            cardContainer.GetSearchResults().ListOfItems().Should().ContainInOrder(PartialDesignFolderB, PartialDesignB);
            cardContainer.Search("a");
            cardContainer.GetSearchResults().ListOfItems().Should().Contain(PartialDesignFolderC).And.HaveCount(8);
            Context.Pages.PartialDesigns.CardContainer.ClearResultsAndCloseOverlay();
        }

        [Test]
        public void UserStartsTyping_InvalidItemNamesInTheSearchBar_NoSearchResults()
        {
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

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
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            cardContainer.Search("PartialDesignFolder");
            cardContainer.GetSearchResults().ClickOnResult("PartialDesignFolder B");

            cardContainer.GetBreadCrumbs().Should().Contain(PartialDesignFolderB);
            cardContainer.GetNumberOfBreadcrumbs().Should().Be(2);
        }

        [Test]
        public void UserSearch_AndClickThePartialDesignInSearchResults_FolderWithPartialDesignIsOpened()
        {
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            cardContainer.Search("PartialDesign");
            cardContainer.GetSearchResults().ClickOnResult(PartialDesignB);

            cardContainer.GetBreadCrumbs().Should().Contain(PartialDesignFolderA).And.Contain(PartialDesignFolderC);
            cardContainer.GetNumberOfBreadcrumbs().Should().Be(3);

            cardContainer.GetDetailsInfo().Should().Contain("NAME", PartialDesignB);
            Context.Pages.PartialDesigns.PartialDesignByName(PartialDesignB).HasSelectedState.Should().BeTrue();
        }

        [Test]
        public void UserSelectsASharedPageDesignFromResults_SharedTabIsOpened()
        {
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            cardContainer.Search("PartialDesign");
            cardContainer.GetSearchResults().ClickOnResult(SharedPartialDesign);

            cardContainer.ActiveTab.Should().Be("Shared sites");
            cardContainer.GetDetailsInfo().Should().Contain("NAME", SharedPartialDesign);
            Context.Pages.PartialDesigns.PartialDesignByName(SharedPartialDesign).HasSelectedState.Should().BeTrue();
        }

        [OneTimeSetUp]
        public void CreateTestDataAndOpenPartialDesigns()
        {
            CreateTestData_SearchPartialDesigns();
            WaitForSearchIndex_PartialDesigns_ToBeIndexed();
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
        }

        [OneTimeTearDown]
        public void CleanUpTestDataAfterAllTests()
        {
            Context.ApiHelper.CleanTestData(keepProtected: false);
        }

        private void CreateTestData_SearchPartialDesigns()
        {
            // create folder PartialDesignFolder A
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderA, doNotDelete: true);

            // create folder PartialDesignFolder B
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderB, doNotDelete: true);

            // create folder PartialDesignFolderC
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderC, Context.TestItems[PartialDesignFolderA].itemId, doNotDelete: true);

            // create PartialDesign A in PartialDesignFolder B
            Preconditions.CreatePartialDesign(PartialDesignA, Context.TestItems[PartialDesignFolderB].itemId, doNotDelete: true);

            // create PartialDesignB in PartialDesignFolder C
            Preconditions.CreatePartialDesign(PartialDesignB, Context.TestItems[PartialDesignFolderC].itemId, doNotDelete: true);

            // create a Shared Partial Design
            Preconditions.CreatePartialDesign(SharedPartialDesign, shared: true, doNotDelete: true);
        }

        private void WaitForSearchIndex_PartialDesigns_ToBeIndexed()
        {
            this.WaitForCondition(c => Context.ApiHelper.PlatformGraphQlClient.SearchResultTotalCount("p", Constants.PartialDesignsPath) > 2, TimeSpan.FromSeconds(30), 2000);
        }
    }
}
