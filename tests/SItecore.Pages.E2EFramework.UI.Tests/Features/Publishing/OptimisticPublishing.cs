// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Publishing;

public class OptimisticPublishing : BaseFixture
{
    private Item _testPage;

    [OneTimeSetUp]
    public void InitEdgeClient()
    {
        Context.ApiHelper.InitializeEdgeClient(TestRunSettings.EdgeDeliveryApi,
            TestRunSettings.EdgeApi,
            Context.EdgeClientId,
            Context.EdgeClientSecret);
    }

    [SetUp]
    public void CreateAndOpenPage()
    {
        _testPage = Preconditions.CreatePage();
    }

    [TearDown]
    public void RevertUserRoles()
    {
        if (TestContext.CurrentContext.Test.MethodName == "PageCannotBePublishedWhenUserNotHaveRole")
        {
            Preconditions.SetUserRoles(TestRunSettings.UserEmail, new List<string>()
            {
                "sitecore\\Sitecore Client Advanced Publishing",
                "sitecore\\Designer",
                "sitecore\\Author"
            });
            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }
    }

    [TestCase("Draft")]
    [TestCase("Awaiting Approval")]
    public void PublishNotVisibleWhenPageNotInFinalWorkflowState(string workflowState)
    {
        string workflowStateId = string.Empty;
        switch (workflowState)
        {
            case "Draft":
                workflowStateId = WorkflowInfo.SampleWorkflow.WorkflowStateDraft;
                break;
            case "Awaiting Approval":
                workflowStateId = WorkflowInfo.SampleWorkflow.WorkflowStateAwaitingApproval;
                break;
        }

        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(_testPage.itemId, "__Workflow State", workflowStateId);

        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(_testPage.name);

        Context.Pages.TopBar.WorkflowBar.WorkflowState.Should().Be(workflowState.ToUpper());

        Context.Pages.TopBar.WorkflowBar.HasPublishButton().Should().BeFalse("Publish button expected to not be visible.");
        Context.Pages.TopBar.WorkflowBar.HasActionsButton().Should().BeTrue("Actions button expected to be visible.");
    }
}
