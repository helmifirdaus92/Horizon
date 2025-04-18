// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class MovePartialDesigns : BaseFixture
    {
        private static string PartialDesignFolder;
        private static string PartialDesignFolderToMove;
        private static string PartialDesignFolderNested;
        private static string PartialDesignFolderNestedRenamed;
        private static string PartialDesign;
        private static string NewCreatedPartialDesignFolder;

        [OneTimeSetUp]
        public void OpenPartialDesigns()
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
        }

        [SetUp]
        public void NewItemNames()
        {
            PartialDesignFolder = "PartialDesignFolder" + DataHelper.RandomString();
            PartialDesignFolderToMove = "PartialDesignFolderToMove" + DataHelper.RandomString();
            PartialDesignFolderNested = "PartialDesignFolderNested" + DataHelper.RandomString();    
            PartialDesignFolderNestedRenamed = "PartialDesignFolderNestedRenamed" + DataHelper.RandomString();
            PartialDesign = "PartialDesign" + DataHelper.RandomString();
            NewCreatedPartialDesignFolder = "NewCreatedPartialDesignFolder" + DataHelper.RandomString();
        }

        [Test]
        public void UserMoves_FolderWithTheSameName_MoveButtonDisabled()
        {
            CreateTestData_UserMoves_FolderWithTheSameName_MoveButtonDisabled();
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;
            cardContainer.SelectFolder(PartialDesignFolderToMove);
            cardContainer.RenameFolder(PartialDesignFolderNestedRenamed, PartialDesignFolderNested);

            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolderNested);
            moveItemDialog.MoveToHeader();
            moveItemDialog.SelectFolderToMove(PartialDesignFolder);
            moveItemDialog.IsMoveButtonDisabled().Should().BeTrue();
            moveItemDialog.Close();
        }

        [Test]
        public void UserMoves_PartialDesignFolderWithPartialDesignInsideToAnotherFolder_Moved()
        {
            CreateTestData_UserMoves_PartialDesignFolderWithPartialDesignInsideToAnotherFolder_Moved();
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolderToMove);
            moveItemDialog.IsMoveButtonDisabled().Should().BeTrue();

            moveItemDialog.SelectFolderToMove(PartialDesignFolder);
            moveItemDialog.ClickMoveButton();

            cardContainer.SelectFolder(PartialDesignFolder);

            cardContainer.GetFolders().Count.Should().Be(2);
            cardContainer.GetFolderTitleElements().Any(folder => folder.Text == PartialDesignFolderToMove);

            cardContainer.SelectFolder(PartialDesignFolderToMove);
            cardContainer.ItemCards.Any(design => design.Title == PartialDesign);
        }

        [Test]
        public void UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved()
        {
            CreateTestData_UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved();
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolderToMove);
            moveItemDialog.CreateNewFolder(NewCreatedPartialDesignFolder);

            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Partial Designs/" + NewCreatedPartialDesignFolder);
            moveItemDialog.SelectFolderToMove(NewCreatedPartialDesignFolder);
            moveItemDialog.ClickMoveButton();

            cardContainer.GetFolders().Count.Should().Be(2);
            cardContainer.GetFolderTitleElements().Any(folder => folder.Text == NewCreatedPartialDesignFolder);

            cardContainer.SelectFolder(NewCreatedPartialDesignFolder);
            cardContainer.SelectFolder(PartialDesignFolderToMove);
            cardContainer.ItemCards.Any(design => design.Title == PartialDesign);
        }

        [Test]
        public void UserMove_FolderToEmptyFolder_FolderIsEmptyDescriptionAppears()
        {
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToMove);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolderToMove);

            moveItemDialog.SelectFolderToMove(PartialDesignFolder);
            moveItemDialog.EmptyFolderDescription.Should().Be("This folder is empty");
            moveItemDialog.Close();
        }

        [Test]
        public void UserCreatesFolder_WithInvalidName_ErrorMsgAppears()
        {
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolder);

            moveItemDialog.CreateNewFolder(PartialDesignFolder);
            Context.Pages.PartialDesigns.TimedNotification.Message.Should().Be($"The item name \"{PartialDesignFolder}\" is already defined on this level.");
            Context.Pages.PartialDesigns.WaitForNotificationToDisappear();

            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToMove);

            moveItemDialog.ClickCancelButton();
            Context.Pages.PartialDesigns.CardContainer.GetFolders().Count.Should().Be(1);
        }

        [Test]
        public void UserCreatesFolder_AndCancelMoveDialog_FolderCreatedInSelectedLocation()
        {
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;
            var moveItemDialog = cardContainer.InvokeMoveDialogOnFolder(PartialDesignFolder);
            moveItemDialog.CreateNewFolder(NewCreatedPartialDesignFolder);
            TestData.PathsToDelete.Add(Constants.PartialDesignsPath + "/" + NewCreatedPartialDesignFolder);
            moveItemDialog.ClickCancelButton();

            Context.Pages.PartialDesigns.CardContainer.GetFolders()
                .Should().HaveCount(2).And.Contain(e => e.Text == NewCreatedPartialDesignFolder);
        }

        private void CreateTestData_UserCreatesNewFolder_AndMoveItemToCreatedFolder_Moved()
        {
            // create folder PartialDesignFolder
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);

            // create folder PartialDesignFolderToMove
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToMove);

            // create PartialDesign in PartialDesignFolderToMove
            Preconditions.CreatePartialDesign(PartialDesign, Context.TestItems[PartialDesignFolderToMove].itemId);
        }

        private void CreateTestData_UserMoves_FolderWithTheSameName_MoveButtonDisabled()
        {
            // create folder PartialDesignFolder
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);

            // create folder PartialDesignFolderNested inside PartialDesignFolder
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderNested, Context.TestItems[PartialDesignFolder].itemId);

            // create folder PartialDesignFolderToMove
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToMove);

            // create PartialDesignFolderNested in PartialDesignFolderToMove
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderNestedRenamed, Context.TestItems[PartialDesignFolderToMove].itemId);
        }

        private void CreateTestData_UserMoves_PartialDesignFolderWithPartialDesignInsideToAnotherFolder_Moved()
        {
            // create folder PartialDesignFolder
            Preconditions.CreatePartialDesignFolder(PartialDesignFolder);

            // create folder PartialDesignFolderNested inside PartialDesignFolder
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderNested, Context.TestItems[PartialDesignFolder].itemId);

            // create folder PartialDesignFolderToMove
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToMove);

            // create PartialDesign in PartialDesignFolderToMove
            Preconditions.CreatePartialDesign(PartialDesign, Context.TestItems[PartialDesignFolderToMove].itemId);
        }
    }
}
