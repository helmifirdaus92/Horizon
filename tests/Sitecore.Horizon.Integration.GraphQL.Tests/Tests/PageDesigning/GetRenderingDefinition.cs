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

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.PageDesigning;

public class GetRenderingDefinition : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void GetRenderingDefinition_GetRenderingInformation()
    {
        // Arrange
        Item contextItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(contextItem);
        Item localDataSource = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Data", contextItem.itemId, Constants.SxaDataSourceTemplateId);
        Item richText = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Text", localDataSource.itemId, Constants.SxaRenderingRichTextTemplate);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRenderingDefinition(
            Constants.SxaRenderingRichText,
            contextItem.itemId,
            site: Constants.SXAHeadlessSite);
        GetRenderingDefinitionResponse renderingDefinitionResponse = JsonConvert.DeserializeObject<GetRenderingDefinitionResponse>(response.Data.ToString());
        RenderingDefinitionPayload renderingDefinition = renderingDefinitionResponse.renderingDefinition;

        // Assert
        renderingDefinition.templates.Count.Should().Be(1);
        renderingDefinition.datasourceRootItems.Should().Contain(x => x.id == new Guid(localDataSource.itemId).ToString());
        renderingDefinition.templates.FirstOrDefault().id.Should().BeEquivalentTo(Constants.SxaRenderingRichTextTemplate);
        renderingDefinition.templates.FirstOrDefault().name.Should().BeEquivalentTo("Text");
    }

    [Test]
    [Category("BITest")]
    public void GetRenderingDefinition_GetDatasourceRootItemsWithChildren()
    {
        // Arrange
        Item contextItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(contextItem);
        Item localDataSource = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Data", contextItem.itemId, Constants.SxaDataSourceTemplateId);
        Item datasourceChild = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Data", localDataSource.itemId, Constants.SxaDataSourceTemplateId);
        Item richText = Context.ApiHelper.PlatformGraphQlClient.CreateItem("Text", datasourceChild.itemId, Constants.SxaRenderingRichTextTemplate);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRenderingDefinition(
            Constants.SxaRenderingRichText,
            contextItem.itemId,
            site: Constants.SXAHeadlessSite);
        GetRenderingDefinitionResponse renderingDefinitionResponse = JsonConvert.DeserializeObject<GetRenderingDefinitionResponse>(response.Data.ToString());
        RenderingDefinitionPayload renderingDefinition = renderingDefinitionResponse.renderingDefinition;

        // Assert
        renderingDefinition.templates.FirstOrDefault().id.Should().BeEquivalentTo(Constants.SxaRenderingRichTextTemplate);
        var datasource = renderingDefinition.datasourceRootItems.Find(d => d.id == new Guid(localDataSource.itemId).ToString());
        datasource.Should().NotBeNull();
        datasource.id.Should().BeEquivalentTo(new Guid(localDataSource.itemId).ToString());
        datasource.children.Count.Should().Be(1);
        datasource.children.First().id.Should().BeEquivalentTo(new Guid(datasourceChild.itemId).ToString());
    }

    [Test]
    [Category("BITest")]
    public void GetRenderingDefinition_DatasourceDetailsNotSet()
    {
        // Arrange
        Item contextItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(contextItem);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRenderingDefinition(
            Constants.SxaRenderingRichText,
            contextItem.itemId,
            site: Constants.SXAHeadlessSite);
        GetRenderingDefinitionResponse renderingDefinitionResponse = JsonConvert.DeserializeObject<GetRenderingDefinitionResponse>(response.Data.ToString());
        RenderingDefinitionPayload renderingDefinition = renderingDefinitionResponse.renderingDefinition;

        // Assert
        foreach (var datasource in renderingDefinition.datasourceRootItems)
        {
            datasource.ancestors.Count.Should().Be(0);
        }
    }

    [Test]
    public void GetRenderingDefinition_InvalidRenderingPath()
    {
        // Arrange & Act
        Item contextItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(contextItem);
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRenderingDefinition(
            "sitecore/home/invalid",
            contextItem.itemId,
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRenderingDefinitionResponse renderingDefinitionResponse = JsonConvert.DeserializeObject<GetRenderingDefinitionResponse>(response.Data.ToString());
        renderingDefinitionResponse.renderingDefinition.Should().BeNull();
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("ItemNotFound");
    }

    [Test]
    public void GetRenderingDefinition_NotRenderingPath()
    {
        // Arrange
        Item contextItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(contextItem);
        Item item = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(item);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRenderingDefinition(
            item.itemId,
            contextItem.itemId,
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRenderingDefinitionResponse renderingDefinitionResponse = JsonConvert.DeserializeObject<GetRenderingDefinitionResponse>(response.Data.ToString());
        renderingDefinitionResponse.renderingDefinition.Should().BeNull();
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("ItemNotFound");
    }

    [Test]
    [Category("BITest")]
    public void GetGroupedComponents_GetCategoryData()
    {
        // Act
        var response = Context.ApiHelper.HorizonGraphQlClient.GetComponents(site: Constants.SXAHeadlessSite);

        //assert
        response.components.groups.Should().NotBeNull();
        response.components.ungrouped.Should().NotBeNull();
        response.components.groups.Find(g => g.title == "System").components.Should().Contain(c => c.displayName == "FieldRenderer");
    }
}
