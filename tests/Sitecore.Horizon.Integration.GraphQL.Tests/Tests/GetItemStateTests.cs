// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Extensions = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Extensions;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class GetItemStateTests : BaseFixture
{
    [Test]
    public void GetItemState_WithoutAdditionalFields_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().NotBeNull();

        page.workflow.Should().BeNull();
        page.displayName.Should().BeNull();
        page.versions.Should().BeNull();
        page.presentationDetails.Should().BeNull();
        page.layoutEditingKind.Should().BeNull();
    }

    [Test]
    public void GetItemState_WithVersions_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.AddVersion();

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, withVersions: true, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.versions.Count.Should().Be(2);
        page.revision.Should().NotBeNull();

        page.workflow.Should().BeNull();
        page.displayName.Should().BeNull();
        page.presentationDetails.Should().BeNull();
        page.layoutEditingKind.Should().BeNull();
    }

    [Test]
    public void GetItemState_WithDisplayName_ShouldReturnPage()
    {
        string displayName = "English page display name";
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.SetFieldValue("__Display name", displayName);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, withDisplayName: true, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().NotBeNull();
        page.displayName.Should().BeEquivalentTo(displayName);

        page.versions.Should().BeNull();
        page.workflow.Should().BeNull();
        page.presentationDetails.Should().BeNull();
        page.layoutEditingKind.Should().BeNull();
    }

    [Test]
    public void GetItemState_WithWorkflow_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.SetFieldValue("__Display name", "Display name");
        pageItem.SetWorkFlow(Constants.SampleWorkflowId);
        pageItem.SetWorkflowState(Constants.WorkflowDraftId);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, withWorkflow: true, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().NotBeNull();
        page.workflow.finalState.Should().BeFalse();
        page.workflow.displayName.Should().BeEquivalentTo("Draft");
        page.workflow.commands.First().displayName.Should().BeEquivalentTo("Submit");
        page.workflow.id.Replace("{", "").Replace("}", "").Should().BeEquivalentTo(Constants.WorkflowDraftId);

        page.versions.Should().BeNull();
        page.displayName.Should().BeNull();
        page.presentationDetails.Should().BeNull();
        page.layoutEditingKind.Should().BeNull();
    }

    [Test]
    public void GetItemState_WithPresentation_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, withPresentation: true, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().NotBeNull();
        page.presentationDetails.Should().NotBeNull();
        page.presentationDetails.Should().Contain("layout");
        page.presentationDetails.Should().Contain("renderings");
        page.presentationDetails.Should().Contain("devices");

        page.versions.Should().BeNull();
        page.displayName.Should().BeNull();
        page.workflow.Should().BeNull();
        page.layoutEditingKind.Should().BeNull();
    }

    [Test]
    public void GetItemState_WithLayoutEditingKind_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, withLayoutEditingKind: true, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().NotBeNull();
        page.layoutEditingKind.Should().BeEquivalentTo("FINAL");

        page.versions.Should().BeNull();
        page.displayName.Should().BeNull();
        page.workflow.Should().BeNull();
    }

    [Test]
    public void GetItemState_NotExistingItem_ShouldReturnError()
    {
        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(Constants.HomePagePath + "/notexistingitem", site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.Should().BeNull();
        item.Errors.First().Message.Should().BeEquivalentTo("ItemNotFound");
    }

    [Test]
    public void GetItemState_ItemDoesntHaveLanguageVersion()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItemState(pageItem.path, language: "da", site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.id.Should().BeEquivalentTo(new Guid(pageItem.itemId).ToString());
        page.revision.Should().BeEmpty();
        page.layoutEditingKind.Should().BeNull();
        page.versions.Should().BeNull();
        page.displayName.Should().BeNull();
        page.workflow.Should().BeNull();
    }
}
