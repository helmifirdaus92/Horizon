// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Extensions = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Extensions;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class WorkflowTests : BaseFixture
{
    [TestCase("Draft")]
    [TestCase("Awaiting Approval")]
    [TestCase("Approved")]
    [Category("BITest")]
    public void GetPage_DraftWorkflow(string workflowState)
    {
        bool isFinalState = false;
        string workflowStateId = string.Empty;

        switch (workflowState)
        {
            case "Draft":
                workflowStateId = Constants.WorkflowDraftId;
                break;
            case "Awaiting Approval":
                workflowStateId = Constants.WorkflowAwaitingApprovalId;
                break;
            case "Approved":
                workflowStateId = Constants.WorkflowApprovedId;
                isFinalState = true;
                break;
        }

        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(workflowStateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse resp = Context.ApiHelper.HorizonGraphQlClient.GetItem(pageItem.path, site: Constants.SXAHeadlessSite);
        GetItemResponse data = JsonConvert.DeserializeObject<GetItemResponse>(resp.Data.ToString());
        var workflow = data.item.workflow;
        var commands = workflow.commands;

        workflow.finalState.Should().Be(isFinalState);
        workflow.canEdit.Should().BeTrue();
        workflow.displayName.Should().BeEquivalentTo(workflowState);
        workflow.id.Replace("{", "").Replace("}", "").Should().Be(workflowStateId);

        switch (workflowState)
        {
            case "Draft":
                commands.Length.Should().Be(1);
                commands[0].displayName.Should().BeEquivalentTo("Submit");
                commands[0].id.Should().BeEquivalentTo(Constants.WorkflowSubmitActionId);
                break;
            case "Awaiting Approval":
                commands.Length.Should().Be(2);
                commands[0].displayName.Should().BeEquivalentTo("Approve");
                commands[0].id.Should().BeEquivalentTo(Constants.WorkflowApproveActionId);
                commands[1].displayName.Should().BeEquivalentTo("Reject");
                commands[1].id.Should().BeEquivalentTo(Constants.WorkflowRejectActionId);
                break;
            case "Approved":
                commands.Length.Should().Be(0);
                break;
        }
    }

    [Test]
    [Category("BITest")]
    public void ExecuteSubmitWorkflowCommand()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowDraftId);
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowSubmitActionId,
            "comment",
            site: Constants.SXAHeadlessSite);
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        ExecuteWorkflowCommandPayload result = data.executeWorkflowCommand;

        result.Should().NotBeNull();
        result.completed.Should().BeTrue();
        result.nextStateId.Should().BeEquivalentTo(Constants.WorkflowAwaitingApprovalId);
        result.item.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
    }

    [Test]
    [Category("BITest")]
    public void SubmitDefaultVersionOfThePage()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowDraftId);
        pageItem.AddVersion("da");
        pageItem.SetWorkFlow(Constants.SampleWorkflowId, "da");
        pageItem.SetWorkflowState(Constants.WorkflowDraftId, "da");
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowSubmitActionId,
            "comment",
            site: Constants.SXAHeadlessSite,
            language: "da");
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        ExecuteWorkflowCommandPayload result = data.executeWorkflowCommand;

        result.completed.Should().BeTrue();
        result.item.language.Should().BeEquivalentTo("da");
        result.nextStateId.Should().BeEquivalentTo(Constants.WorkflowAwaitingApprovalId);

        Item itemEn = Context.ApiHelper.PlatformGraphQlClient.GetItem(pageItem.path);
        Item itemDa = Context.ApiHelper.PlatformGraphQlClient.GetItem(pageItem.path, "da");

        itemEn.workflow.workflowState.stateId.Replace("{", "").Replace("}", "").Should().BeEquivalentTo(Constants.WorkflowDraftId);
        itemDa.workflow.workflowState.stateId.Replace("{", "").Replace("}", "").Should().BeEquivalentTo(Constants.WorkflowAwaitingApprovalId);
    }

    [Test]
    [Category("BITest")]
    public void MoveThePageToTheFinalWorkflowState()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowAwaitingApprovalId);
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowApproveActionId,
            "comment",
            site: Constants.SXAHeadlessSite);
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        ExecuteWorkflowCommandPayload result = data.executeWorkflowCommand;

        result.completed.Should().BeTrue();
        result.nextStateId.Should().BeEquivalentTo(Constants.WorkflowApprovedId);
        result.item.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
    }

    [Test]
    [Category("BITest")]
    public void MoveThePageToThePreviousWorkflowState()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowAwaitingApprovalId);
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowRejectActionId,
            "comment",
            site: Constants.SXAHeadlessSite);
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        ExecuteWorkflowCommandPayload result = data.executeWorkflowCommand;

        result.completed.Should().BeTrue();
        result.nextStateId.Should().BeEquivalentTo(Constants.WorkflowDraftId);
        result.item.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
    }

    [Test]
    [Category("BITest")]
    public void MovePageWithoutWorkflow()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowApproveActionId,
            "comment",
            site: Constants.SXAHeadlessSite);
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        data.executeWorkflowCommand.Should().BeNull();

        executeCommandResponse.Errors.Length.Should().Be(1);
        executeCommandResponse.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("The item is currently not part of a workflow.");

        Context.ApiHelper.PlatformGraphQlClient.GetItem(pageItem.path).workflow.Should().BeNull();
    }

    [Test]
    [Category("BITest")]
    public void ExecuteWorkflowCommand_ShouldNotComplete()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowAwaitingApprovalId);
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(pageItem.itemId, "__Lock", "ItemLockedByAnotherUser");
        TestData.Items.Add(pageItem);

        GraphQLResponse executeCommandResponse = Context.ApiHelper.HorizonGraphQlClient.ExecuteWorkflowCommand(
            pageItem.itemId,
            Constants.WorkflowApproveActionId,
            "comment",
            site: Constants.SXAHeadlessSite);
        ExecuteWorkflowCommandResponse data = JsonConvert.DeserializeObject<ExecuteWorkflowCommandResponse>(executeCommandResponse.Data.ToString());
        data.executeWorkflowCommand.Should().NotBeNull();
        data.executeWorkflowCommand.completed.Should().BeFalse();
        data.executeWorkflowCommand.error.Should().BeEquivalentTo("The workflow command did not complete.");

        // Locked workflow should not be updated
        /*GraphQLResponse itemResponse = Context.ApiHelper.HorizonGraphQlClient.GetItem(pageItem.path, site: Constants.SXAHeadlessSite);
        GetItemResponse item = JsonConvert.DeserializeObject<GetItemResponse>(itemResponse.Data.ToString());
        item.item.workflow.id.Should().BeEquivalentTo(Constants.WorkflowAwaitingApprovalId);*/
    }
}
