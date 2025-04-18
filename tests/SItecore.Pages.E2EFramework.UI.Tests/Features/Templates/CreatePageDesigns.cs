// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Constants = Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Constants;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Templates
{
    public class CreatePageDesigns : BaseFixture
    {
        private const string PartialDesignA = "PartialDesign A";
        private const string PartialDesignB = "PartialDesignB";
        private const string ExistedPageDesignFolderName = "Existed Page designs Folder Name";
        private const string PageDesignFolderToDelete = "Page designs Folder to delete";
        private const string CancelFolderName = "Cancel folder Name";
        private const string NewFolderName = "NewFolderName";
        private const string NewValidFolderName = "NewValidFolderName";
        private const string ExistedPageDesign = "Existed Page design";
        private const string CancelDesign = "Cancel design";
        private const string NewCreatedPageDesign = "New created page design";
        private const string RenamedPageDesign = "Renamed Page design";
        private const string PageDesignToDelete = "Page design to delete";

        [Test]
        public void UserSearchPartialDesigns_WhenCreatesPageDesign()
        {
            Preconditions.CreatePartialDesign(PartialDesignA, doNotDelete: false);
            Preconditions.CreatePartialDesign(PartialDesignB, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // open Page Design Editor
            cardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePageDesign()
                .EnterItemName("New page design A")
                .ClickCreateButton();

            var editorPanel = Context.Pages.EditPageDesign.LeftHandPanel.PageDesignsEditorPanel;

            // search for created partial designs
            editorPanel.Search("PartialDesign");

            // check that search result contains appropriate partial designs
            editorPanel.AvailablePartialDesigns.Should().HaveCount(2);
            editorPanel.AvailablePartialDesigns.Select(d => d.Text).Should().Contain(PartialDesignA, PartialDesignB);
            Context.Pages.EditPageDesign.Close();
        }

        [Test]
        public void UserCreates_NewPageDesignFolder_UsingCreateButton()
        {
            Preconditions.CreatePageDesignFolder(ExistedPageDesignFolderName, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + NewFolderName);

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // input field validation
            cardContainer.CreateFolder("");
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.NameCannotBeEmptyErrMsg);
            cardContainer.CreateFolder("^$&");
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.InvalidCharactersErrMsg);
            cardContainer.CreateFolder(ExistedPageDesignFolderName);
            CheckTimedNotificationMessageAndWaitItToDisappear(Constants.NameIsAlreadyInUseErrMsg);

            // cancel when create validation
            cardContainer.CreateFolderButCancel(CancelFolderName);
            cardContainer.GetFolderTitles().Should().NotContain(CancelFolderName);

            // create folder and check order
            cardContainer.CreateFolder(NewFolderName);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view and check order
            cardContainer.GetFolderTitles().Should().BeInAscendingOrder().And.Contain(NewFolderName);
        }

        [Test]
        public void UserRenames_PageDesignFolder()
        {
            Preconditions.CreatePageDesignFolder(ExistedPageDesignFolderName, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // rename folder and check
            cardContainer.RenameFolder(ExistedPageDesignFolderName, NewValidFolderName);

            Context.Pages.PageDesigns.CardContainer.GetFolderTitles().Should().Contain(NewValidFolderName)
                .And.NotContain(ExistedPageDesignFolderName);
        }

        [Test]
        public void UserDeletes_PageDesignsFolder()
        {
            Preconditions.CreatePageDesignFolder(PageDesignFolderToDelete, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // delete but cancel folder
            cardContainer.CancelDeleteFolder(PageDesignFolderToDelete);

            // check that folder still exists after cancel deletion
            Context.Pages.PageDesigns.CardContainer.GetFolderTitles().Should().Contain(PageDesignFolderToDelete);
            Context.ApiHelper.PlatformGraphQlClient.GetItem(Context.TestItems[PageDesignFolderToDelete].itemId).Should().NotBeNull();

            // delete page designs folder
            cardContainer.DeleteFolder(PageDesignFolderToDelete);
            Context.Pages.PageDesigns.CardContainer.GetFolderTitles().Should().NotContain(PageDesignFolderToDelete);
        }

        [Test]
        public void UserCreates_NewPageDesign_UsingCreateButton()
        {
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + NewCreatedPageDesign);

            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // cancel when create validation
            cardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePageDesign()
                .EnterItemName(CancelDesign)
                .ClickCancelButton();

            cardContainer.GetItemCardNames().Should().NotContain(CancelFolderName);

            // create page design
            cardContainer.InvokeContextMenuOnCreate()
                .InvokeCreatePageDesign()
                .EnterItemName(NewCreatedPageDesign)
                .ClickCreateButton();

            Thread.Sleep(2000); //Wait for thumbnail files to be generated
            if (!Context.Pages.EditPageDesign.IsOpened())
            {
                Context.Pages.EditPageDesign.WaitForLoad();
            }

            Context.Pages.EditPageDesign.Close();

            Context.Pages.PageDesigns.CardContainer
                .GetItemCardNames().Should()
                .Contain(NewCreatedPageDesign);
        }

        [Test]
        public void UserRenames_PageDesign_InputValidation()
        {
            Preconditions.CreatePageDesign(ExistedPageDesign, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            var renameDialog = Context.Pages.PageDesigns.CardContainer
                .InvokeRenameDesignDialog(ExistedPageDesign);

            renameDialog.EnterItemName("");
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameCannotBeEmptyErrMsg);
            renameDialog.EnterItemName("__*^^&");
            renameDialog.ValidationErrorMsg.Should().Be(Constants.InvalidCharactersErrMsg);
            renameDialog.EnterItemName(ExistedPageDesign);
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameIsAlreadyInUseErrMsg);
            renameDialog.EnterItemName(Wrappers.Helpers.GenerateLongString(101));
            renameDialog.ClickSaveButtonWithoutWaiting();
            renameDialog.ValidationErrorMsg.Should().Be(Constants.NameLengthErrMsg);
            renameDialog.Close();
        }

        [Test]
        public void UserRenames_ExistedPageDesign()
        {
            Preconditions.CreatePageDesign(ExistedPageDesign, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Constants.SXAHeadlessSite}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + RenamedPageDesign);
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            // cancel when rename validation
            cardContainer.InvokeRenameDesignDialog(ExistedPageDesign)
                .EnterItemName(RenamedPageDesign)
                .ClickCancelButton();

            cardContainer.GetItemCardNames().Should().NotContain(RenamedPageDesign);

            // rename page design
            cardContainer.InvokeRenameDesignDialog(ExistedPageDesign)
                .EnterItemName(RenamedPageDesign)
                .ClickSaveButton();

            Context.Pages.PageDesigns.CardContainer.GetItemCardNames().Should().Contain(RenamedPageDesign);
        }

        [Test]
        public void UserDeletes_PageDesign()
        {
            Preconditions.CreatePageDesign(PageDesignToDelete, doNotDelete: false);
            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view
            TestData.PathsToDelete.Add($"/sitecore/content/{Context.SXAHeadlessTenant}/{Constants.SXAHeadlessSite}/Presentation/Page Designs/" + PageDesignToDelete);
            var cardContainer = Context.Pages.PageDesigns.CardContainer;

            cardContainer.InvokeDeleteDesignDialog(PageDesignToDelete)
                .ClickCancelButton();

            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            cardContainer.GetItemCardNames().Should().Contain(PageDesignToDelete);

            cardContainer.InvokeDeleteDesignDialog(PageDesignToDelete)
                .ClickDeleteButton();

            Context.Pages.PageDesigns.CardContainer
                .SelectSharedSiteTab()
                .SelectCurrentSiteTab(); //Refreshing context to bring new items to view

            cardContainer.GetItemCardNames().Should().NotContain(PageDesignToDelete);
        }

        [SetUp]
        public void ClearNotificationsFromEditPageDesignView()
        {
            if (Context.Pages.PageTemplates.TimedNotificationExists())
            {
                Context.Pages.PageTemplates.TimedNotification.Close();
            }
        }

        [TearDown]
        public void DeleteTestData()
        {
            if (TestContext.CurrentContext.Test.MethodName == "UserSearchPartialDesigns_WhenCreatesPageDesign")
            {
                var sitePageDesigns = Context.ApiHelper.PlatformGraphQlClient.GetPageDesigns(Constants.SXAHeadlessSite);
                var tenantDesign = sitePageDesigns.Find(i => i.pageDesign.name.Equals("New page design A"));
                if (tenantDesign != null)
                {
                    var pageDesign = Context.ApiHelper.PlatformGraphQlClient.GetItem(tenantDesign.pageDesign.itemId);
                    TestData.Items.Add(pageDesign);
                }
            }
        }

        [OneTimeSetUp]
        public void OpenPageDesigns()
        {
            Context.Pages.TopBar.OpenSitesDropdown().SelectSite(site: Constants.SXAHeadlessSite);
            Context.Pages.TopBar.AppNavigation.OpenTemplates();
            Context.Pages.PageTemplates.TemplatesLHSPanel.OpenPageDesigns();
        }

        private void CheckTimedNotificationMessageAndWaitItToDisappear(string message)
        {
            Context.Pages.PageDesigns.TimedNotification.Message.Should().Be(message);
            Context.Pages.PageDesigns.WaitForNotificationToDisappear();
        }
    }
}
