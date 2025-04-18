// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class MovePageDesigns : BaseFixture
    {
        private static string PageDesignFolder;
        private static string PageDesignFolderToMove;
        private static string PageDesignFolderNested;
        private static string PageDesignFolderNestedRenamed;
        private static string PageDesign;
        private static string NewCreatedPageDesignFolder;

        [OneTimeSetUp]
        public void OpenPageDesigns()
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        }

        [SetUp]
        public void ClearNotificationsFromEditPageDesignView()
        {
            if (Context.Pages.PageTemplates.TimedNotificationExists())
            {
                Context.Pages.PageTemplates.TimedNotification.Close();
            }

            PageDesignFolder = "PageDesignFolder" +DataHelper.RandomString();
            PageDesignFolderToMove = "PageDesignFolderToMove" + DataHelper.RandomString();
            PageDesignFolderNested = "PageDesignFolderNested" + DataHelper.RandomString();
            PageDesignFolderNestedRenamed = "PageDesignFolderNestedRenamed" + DataHelper.RandomString();
            PageDesign = "PageDesign" + DataHelper.RandomString();
            NewCreatedPageDesignFolder = "NewCreatedPageDesignFolder" + DataHelper.RandomString();
        }

        [Test]
        public void UserMoves_FolderWithTheSameName_MoveButtonDisabled()
        {
            CreateTestData_UserMoves_FolderWithTheSameName_MoveButtonDisabled();
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            cardContainer.SelectFolder(PageDesignFolderToMove);
            cardContainer.RenameFolder(PageDesignFolderNestedRenamed, PageDesignFolderNested);

            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolderNested);
            moveItemDialog.MoveToHeader();
            moveItemDialog.SelectFolderToMove(PageDesignFolder);
            moveItemDialog.IsMoveButtonDisabled().Should().BeTrue();
            moveItemDialog.Close();
        }

        [Test]
        public void UserMoves_PageDesignFolderWithPageDesignInsideToAnotherFolder_Moved()
        {
            CreateTestData_UserMoves_PageDesignFolderWithPageDesignInsideToAnotherFolder_Moved();
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolderToMove);
            moveItemDialog.IsMoveButtonDisabled().Should().BeTrue();

            moveItemDialog.SelectFolderToMove(PageDesignFolder);
            moveItemDialog.ClickMoveButton();

            cardContainer.SelectFolder(PageDesignFolder);

            cardContainer.GetFolders().Count.Should().Be(2);
            cardContainer.GetFolderTitleElements().Any(folder => folder.Text == PageDesignFolderToMove);

            cardContainer.SelectFolder(PageDesignFolderToMove);
            cardContainer.ItemCards.Any(design => design.Title == PageDesign);
        }

        [Test]
        public void UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved()
        {
            CreateTestData_UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved();
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolderToMove);
            moveItemDialog.CreateNewFolder(NewCreatedPageDesignFolder);

            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + NewCreatedPageDesignFolder);
            moveItemDialog.SelectFolderToMove(NewCreatedPageDesignFolder);
            moveItemDialog.ClickMoveButton();

            cardContainer.GetFolders().Count.Should().Be(2);
            cardContainer.GetFolderTitleElements().Any(folder => folder.Text == NewCreatedPageDesignFolder);

            cardContainer.SelectFolder(NewCreatedPageDesignFolder);
            cardContainer.SelectFolder(PageDesignFolderToMove);
            cardContainer.ItemCards.Any(design => design.Title == PageDesign);
        }

        [Test]
        public void UserMove_FolderToEmptyFolder_FolderIsEmptyDescriptionAppears()
        {
            Preconditions.CreatePageDesignFolder(PageDesignFolder);
            Preconditions.CreatePageDesignFolder(PageDesignFolderToMove);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolderToMove);

            moveItemDialog.SelectFolderToMove(PageDesignFolder);
            moveItemDialog.EmptyFolderDescription.Should().Be("This folder is empty");
            moveItemDialog.Close();
        }

        [Test]
        public void UserCreatesFolder_WithInvalidName_ErrorMsgAppears()
        {
            Preconditions.CreatePageDesignFolder(PageDesignFolder);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolder);

            moveItemDialog.CreateNewFolder(PageDesignFolder);
            Context.Pages.PageDesigns.TimedNotification.Message.Should().Be($"The item name \"{PageDesignFolder}\" is already defined on this level.");
            Context.Pages.PageDesigns.WaitForNotificationToDisappear();

            Preconditions.CreatePageDesignFolder(PageDesignFolderToMove);

            moveItemDialog.ClickCancelButton();
            Context.Pages.PageDesigns.CardContainer.GetFolders().Count.Should().Be(1);
        }

        [Test]
        public void UserCreatesFolder_AndCancelMoveDialog_FolderCreatedInSelectedLocation()
        {
            Preconditions.CreatePageDesignFolder(PageDesignFolder);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PageDesignFolder);
            moveItemDialog.CreateNewFolder(NewCreatedPageDesignFolder);
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + NewCreatedPageDesignFolder);
            moveItemDialog.ClickCancelButton();

            Context.Pages.PageDesigns.CardContainer.GetFolders()
                .Should().HaveCount(2).And.Contain(e => e.Text == NewCreatedPageDesignFolder);
        }

        private void CreateTestData_UserMoves_FolderWithTheSameName_MoveButtonDisabled()
        {
            // create folder PageDesignFolder
            Preconditions.CreatePageDesignFolder(PageDesignFolder);

            // create folder PageDesignFolderNested inside PageDesignFolder
            Preconditions.CreatePageDesignFolder(PageDesignFolderNested, Context.TestItems[PageDesignFolder].itemId);

            // create folder PageDesignFolderToMove
            Preconditions.CreatePageDesignFolder(PageDesignFolderToMove);

            // create PageDesignFolderNested in PageDesignFolderToMove
            Preconditions.CreatePageDesignFolder(PageDesignFolderNestedRenamed, Context.TestItems[PageDesignFolderToMove].itemId);
        }

        private void CreateTestData_UserMoves_PageDesignFolderWithPageDesignInsideToAnotherFolder_Moved()
        {
            // create folder PageDesignFolder
            Preconditions.CreatePageDesignFolder(PageDesignFolder);

            // create folder PageDesignFolderNested inside PageDesignFolder
            Preconditions.CreatePageDesignFolder(PageDesignFolderNested, Context.TestItems[PageDesignFolder].itemId);

            // create folder PageDesignFolderToMove
            Preconditions.CreatePageDesignFolder(PageDesignFolderToMove);

            // create PageDesign in PageDesignFolderToMove
            Preconditions.CreatePageDesign(PageDesign, Context.TestItems[PageDesignFolderToMove].itemId);
        }

        private void CreateTestData_UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved()
        {
            // create folder PageDesignFolder
            Preconditions.CreatePageDesignFolder(PageDesignFolder);

            // create folder PageDesignFolderToMove
            Preconditions.CreatePageDesignFolder(PageDesignFolderToMove);

            // create PageDesign in PageDesignFolderToMove
            Preconditions.CreatePageDesign(PageDesign, Context.TestItems[PageDesignFolderToMove].itemId);
        }
    }
}
