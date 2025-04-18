// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Workflow;

public class WorkFlow : BaseFixture
{
    private IItem _submitActionItem;

    [OneTimeSetUp]
    public void OpenEditorInTestSite()
    {
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenEnglishLanguage();
        _submitActionItem = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Workflows/Sample Workflow/Draft/Submit");
    }

    [SetUp]
    public void OpenSiteTreeAtStartOfEachTests()
    {
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
    }

    [TestCase("Approve")]
    [TestCase("Reject")]
    public void UserCanMovePageThroughWorkflow_WorkflowIsUpdated(string finalState)
    {
        var pageA = Preconditions.CreatePage();
        string comment = "Felt like leaving a comment here";
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

        Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("DRAFT");
        Context.Pages.Editor.TopBar.WorkflowBar.HasActionsButton().Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.HasPublishButton().Should().BeFalse();
        Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Submit").Submit();
        Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("AWAITING APPROVAL");
        Context.Pages.Editor.TopBar.WorkflowBar.HasActionsButton().Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.HasPublishButton().Should().BeFalse();
        Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions(finalState).SubmitWithComment(comment);
        var workflowHistory = Context.ApiHelper.PlatformGraphQlClient.GetWorkflowEvents(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowId, pageA.itemId);
        switch (finalState)
        {
            case "Reject":
                workflowHistory
                    .Find(e => e.newState.displayName.Equals("Draft") && e.oldState.displayName.Equals("Awaiting Approval"))
                    .comments.Should().Contain(comment).And.HaveCount(1);
                Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("DRAFT");
                Context.Pages.Editor.TopBar.WorkflowBar.HasActionsButton().Should().BeTrue();
                Context.Pages.Editor.TopBar.WorkflowBar.HasPublishButton().Should().BeFalse();
                break;
            case "Approved":
            default:
                workflowHistory
                    .Find(e => e.newState.displayName.Equals("Approved") && e.oldState.displayName.Equals("Awaiting Approval"))
                    .comments.Should().Contain(comment).And.HaveCount(1);
                Context.Pages.Editor.TopBar.WorkflowBar.HasPublishButton().Should().BeTrue();
                Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("APPROVED");
                break;
        }
    }

    [Test]
    public void ItemWithNoWorkflow_PublishButtonIsDisplayed()
    {
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name != "Home")
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath("Home").Select();
        }
        Context.Pages.Editor.TopBar.WorkflowBar.HasPublishButton().Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.IsWorkFLowDisplayed.Should().BeFalse();
    }

    [TestCase("Draft", "Submit")]
    [TestCase("Awaiting Approval", "Reject")]
    public void PageWithDataSources_DatasourceWorkflowIsUpdatedAsWell(string pageState, string action)
    {
        IItem pageA = Preconditions.CreatePage();
        if (pageState.Equals("Awaiting Approval"))
        {
            pageA.SetWorkflowState(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowStateAwaitingApproval);
        }

        Preconditions.AddComponent(pageA.itemId, pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
        Preconditions.AddComponent(pageA.itemId, pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

        IItem datasourceItem1 = Context.ApiHelper.PlatformGraphQlClient.GetItem(pageA.path + "/Data/Image 1");
        IItem datasourceItem2 = Context.ApiHelper.PlatformGraphQlClient.GetItem(pageA.path + "/Data/Text 1");
        datasourceItem1.SetWorkFlow(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowId);
        datasourceItem1.SetWorkflowState(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowStateDraft);
        datasourceItem2.SetWorkFlow(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowId);
        datasourceItem2.SetWorkflowState(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowStateAwaitingApproval);

        Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions(action).Submit();
        switch (action)
        {
            case "Submit":
                Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("AWAITING APPROVAL");
                Context.ApiHelper.PlatformGraphQlClient.GetItem(datasourceItem1.path).workflow.workflowState.displayName.Should().Be("Awaiting Approval");
                Context.ApiHelper.PlatformGraphQlClient.GetItem(datasourceItem2.path).workflow.workflowState.displayName.Should().Be("Awaiting Approval");
                break;
            case "Reject":
            default:

                Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("DRAFT");
                Context.ApiHelper.PlatformGraphQlClient.GetItem(datasourceItem1.path).workflow.workflowState.displayName.Should().Be("Draft");
                Context.ApiHelper.PlatformGraphQlClient.GetItem(datasourceItem2.path).workflow.workflowState.displayName.Should().Be("Draft");
                break;
        }
    }

    [Test]
    public void LockedPage_ActionsButtonIsDisabled()
    {
        IItem pageA = Preconditions.CreatePage();
        string value = $"<r owner=\"sitecore\\randomUser\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />";
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageA.itemId, "__Lock", value);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();
        Context.Pages.Editor.TopBar.WorkflowBar.GetActionsMessage().Should().Be(Constants.ItemLockedByAnotherUser);
        Context.Pages.Editor.TopBar.WorkflowBar.IsActionsButtonDisabled.Should().BeTrue();
    }

    [Test]
    public void ValidationError_ErrorMessageDisplayedAndWorkflowNotUpdate()
    {
        IItem pageA = Preconditions.CreatePage();
        string value = "one <song> two </song> a broken HTML";
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageA.itemId, "Content", value);
        pageA.SetWorkflowState(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowStateAwaitingApproval);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();


        Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Approve").Submit();
        TimedNotification notification = Context.Pages.Editor.TimedNotification;
        notification.Type.Should().Be(NotificationType.Warning);
        notification.Message.Should().Contain("The page was not moved to the new workflow state.")
            .And.Contain("Error. You cannot approve an item with validation errors.");
        notification.Close();
        Context.Pages.Editor.WaitForNotificationToDisappear();
    }

    [Test]
    public void UserWithNoWriteAccess_ActionsButtonIsDisabled()
    {
        IItem pageA = Preconditions.CreatePage();
        Context.ApiHelper.PlatformGraphQlClient.DenyWriteAccess(pageA.itemId, TestRunSettings.UserEmail);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

        Context.Pages.Editor.TopBar.WorkflowBar.IsActionsButtonDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.GetActionsMessage().Should().Be(Constants.NoWriteAccess);
    }

    [Test]
    public void UserWithNoWorkflowCommandExecuteAccess_ActionsButtonIsDisabled()
    {
        IItem pageA = Preconditions.CreatePage();
        _submitActionItem = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Workflows/Sample Workflow/Draft/Submit");
        Context.ApiHelper.PlatformGraphQlClient.DenyWorkflowCommandExecuteAccess(_submitActionItem.itemId, TestRunSettings.UserEmail);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

        Context.Pages.Editor.TopBar.WorkflowBar.IsActionsButtonDisabled.Should().BeTrue();
        Context.Pages.Editor.TopBar.WorkflowBar.GetActionsMessage().Should().Be(Constants.NoWorkflowWriteAccess);
        Context.ApiHelper.PlatformGraphQlClient.AllowWorkflowCommandExecuteAccess(_submitActionItem.itemId, TestRunSettings.UserEmail);
    }

    public class AdminLoginTests : BaseFixture
    {
        [OneTimeSetUp]
        public void AdminLogin()
        {
            Context.Pages.Logout();
            Context.LoginPage.Login(TestRunSettings.AdminUser, TestRunSettings.AdminPassword, TestRunSettings.StartUrl);
            Context.Browser.GetDriver().Navigate().GoToUrl($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Preconditions.OpenSXAHeadlessSite();
        }

        [Test]
        public void LockedPage_WorkflowIsUpdated()
        {
            IItem pageA = Preconditions.CreatePage();
            string value = $"<r owner=\"sitecore\\randomUser\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />";
            Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageA.itemId, "__Lock", value);

            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

            Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Submit").Submit();
            Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("AWAITING APPROVAL");
        }

        [Test]
        public void LockedDatasource_WorkflowIsUpdated()
        {
            IItem pageA = Preconditions.CreatePage();
            Preconditions.AddComponent(pageA.itemId, pageA.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Image));
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();
            IItem datasourceItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(pageA.path + "/Data/Image 1");
            datasourceItem.SetWorkFlow(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowId);
            datasourceItem.SetWorkflowState(DefaultScData.WorkflowInfo.SampleWorkflow.WorkflowStateDraft);
            string value = $"<r owner=\"sitecore\\randomUser\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />";
            Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(datasourceItem.itemId, "__Lock", value);

            //Reselect page to fetch updated DS details
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RootItem.Select();
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageA.name).Select();

            Context.Pages.Editor.TopBar.WorkflowBar.GetActionsMessage().Should().Be(Constants.DatasourceLockedByAnotherUser);
            Context.Pages.Editor.TopBar.WorkflowBar.OpenWorkflowActions().PerformWorkflowActions("Submit").Submit();
            Context.Pages.Editor.TopBar.WorkflowBar.WorkflowState.Should().Be("AWAITING APPROVAL");
            Context.ApiHelper.PlatformGraphQlClient.GetItem(datasourceItem.path).workflow.workflowState.displayName.Should().Be("Awaiting Approval");
        }

        [OneTimeTearDown]
        public void UserLogin()
        {
            Context.Pages.Logout();
            Context.LoginPage.Login(TestRunSettings.UserEmail, TestRunSettings.UserPassword, TestRunSettings.StartUrl);
            Context.Browser.GetDriver().Navigate().GoToUrl($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}");
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
            Preconditions.OpenSXAHeadlessSite();
            Preconditions.OpenEnglishLanguage();
        }
    }
}
