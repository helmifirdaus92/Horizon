// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class CreatePartialDesigns : BaseFixture
    {
        private const string ExistedPartialDesignFolderName = "Existed Partial designs Folder Name";
        private const string PartialDesignFolderToDelete = "Partial designs Folder to delete";
        private const string CancelFolderName = "Cancel folder Name";
        private const string NewFolderName = "NewFolderName";
        private const string NewValidFolderName = "NewValidFolderName";
        private const string ExistedPartialDesign = "Existed Partial design";
        private const string CancelDesign = "Cancel design";
        private const string NewCreatedPartialDesign = "New created Partial design";
        private const string RenamedPartialDesign = "Renamed Partial design";
        private const string PartialDesignToDelete = "Partial design to delete";

        [Test]
        public void UserCreates_NewPartialDesignFolder_UsingCreateButton()
        {
            Preconditions.CreatePartialDesignFolder(ExistedPartialDesignFolderName, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Partial Designs/" + NewFolderName);

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            // input field validation
            cardContainer.CreateFolder("");
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.NameCannotBeEmptyErrMsg);
            cardContainer.CreateFolder("^$&");
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.InvalidCharactersErrMsg);
            cardContainer.CreateFolder(ExistedPartialDesignFolderName);
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.NameIsAlreadyInUseErrMsg);

            // cancel when create validation
            cardContainer.CreateFolderButCancel(CancelFolderName);
            cardContainer.GetFolderTitles().Should().NotContain(CancelFolderName);

            // create folder and check order
            cardContainer.CreateFolder(NewFolderName);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view and check order
            cardContainer.GetFolderTitles().Should().BeInAscendingOrder().And.Contain(NewFolderName);
        }

        [Test]
        public void UserRenames_PartialDesignFolder()
        {
            Preconditions.CreatePartialDesignFolder(ExistedPartialDesignFolderName, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            // rename folder and check
            cardContainer.RenameFolder(ExistedPartialDesignFolderName, NewValidFolderName);

            Context.Pages.PartialDesigns.CardContainer.GetFolderTitles().Should().Contain(NewValidFolderName)
                .And.NotContain(ExistedPartialDesignFolderName);
        }

        [Test]
        public void UserDeletes_PageDesignsFolder()
        {
            Preconditions.CreatePartialDesignFolder(PartialDesignFolderToDelete, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            // delete but cancel folder
            cardContainer.CancelDeleteFolder(PartialDesignFolderToDelete);

            // check that folder still exists after cancel deletion
            Context.Pages.PartialDesigns.CardContainer.GetFolderTitles().Should().Contain(PartialDesignFolderToDelete);
            Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PartialDesignFolderToDelete].itemId).Should().NotBeNull();

            // delete page designs folder
            cardContainer.DeleteFolder(PartialDesignFolderToDelete);
            Context.Pages.PartialDesigns.CardContainer.GetFolderTitles().Should().NotContain(PartialDesignFolderToDelete);
        }

        [Test]
        public void UserCreates_NewPartialDesign_InputValidation()
        {
            Preconditions.CreatePartialDesign(ExistedPartialDesign, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var createDialog = Context.Pages.PartialDesigns.CardContainer.InvokeContextMenuOnCreate().InvokeCreatePartialDesign();

            createDialog.EnterItemName("*(&*^%&%");
            createDialog.ValidationErrorMsg.Should().Be(Constants.InvalidCharactersErrMsg);
            createDialog.EnterItemName("");
            createDialog.ValidationErrorMsg.Should().Be(Constants.NameCannotBeEmptyErrMsg);
            createDialog.EnterItemName(ExistedPartialDesign);
            createDialog.ValidationErrorMsg.Should().Be(Constants.NameIsAlreadyInUseErrMsg);
            createDialog.EnterItemName(Wrappers.Helpers.GenerateLongString(101));
            createDialog.ClickCreateButton();
            createDialog.ValidationErrorMsg.Should().Be(Constants.NameLengthErrMsg);
            createDialog.Close();
        }

        [Test]
        public void UserCreates_NewPartialDesign_UsingCreateButton()
        {
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Partial Designs/" + NewCreatedPartialDesign);

            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            // cancel when create validation
            cardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePartialDesign()
                .EnterItemName(CancelDesign)
                .ClickCancelButton();

            cardContainer.GetItemCardNames().Should().NotContain(CancelFolderName);

            // create Partial design
            cardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePartialDesign()
                .EnterItemName(NewCreatedPartialDesign)
                .ClickCreateButton();

            Thread.Sleep(2000); //Wait for thumbnail files to be generated
            if (!Context.Pages.EditPartialDesign.IsOpened())
            {
                Context.Pages.EditPartialDesign.WaitForLoad();
            }

            Context.Pages.EditPartialDesign.Close();

            Context.Pages.PartialDesigns.CardContainer
                .GetItemCardNames().Should()
                .Contain(NewCreatedPartialDesign);
        }

        [Test]
        public void UserRenames_ExistedPartialDesign()
        {
            Preconditions.CreatePartialDesign(ExistedPartialDesign, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Partial Designs/" + RenamedPartialDesign);
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            // cancel when rename validation
            cardContainer.InvokeRenameDesignDialog(ExistedPartialDesign)
                .EnterItemName(RenamedPartialDesign)
                .ClickCancelButton();

            cardContainer.GetItemCardNames().Should().NotContain(RenamedPartialDesign);

            // rename Partial design
            cardContainer.InvokeRenameDesignDialog(ExistedPartialDesign)
                .EnterItemName(RenamedPartialDesign)
                .ClickSaveButton();

            Context.Pages.PartialDesigns.CardContainer.GetItemCardNames().Should().Contain(RenamedPartialDesign);
        }

        [Test]
        public void UserDeletes_PartialDesign()
        {
            Preconditions.CreatePartialDesign(PartialDesignToDelete, doNotDelete: false);
            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Partial Designs/" + PartialDesignToDelete);
            var cardContainer = Context.Pages.PartialDesigns.CardContainer;

            cardContainer.InvokeDeleteDesignDialog(PartialDesignToDelete)
                .ClickCancelButton();

            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            cardContainer.GetItemCardNames().Should().Contain(PartialDesignToDelete);

            cardContainer.InvokeDeleteDesignDialog(PartialDesignToDelete)
                .ClickDeleteButton();

            Context.Pages.PartialDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            cardContainer.GetItemCardNames().Should().NotContain(PartialDesignToDelete);
        }

        [SetUp]
        public void ClearNotificationsFromEditPartialDesignView()
        {
            if (Context.Pages.PageTemplates.TimedNotificationExists())
            {
                Context.Pages.PageTemplates.TimedNotification.Close();
            }
        }

        [OneTimeSetUp]
        public void OpenPartialDesigns()
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPartialDesigns();
        }

        private void CheckTimedNotificationMessageAndWaitItToDisappear(string message)
        {
            Context.Pages.PartialDesigns.TimedNotification.Message.Should().Be(message);
            Context.Pages.PartialDesigns.WaitForNotificationToDisappear();
        }
    }
}
