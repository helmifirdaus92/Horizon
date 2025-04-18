// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

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

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class CreateItemTests : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void CreatePageItemInDetails()
    {
        // Create page item
        string itemName = Extensions.GetRandomName();
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(
            itemName,
            HomePageItem.itemId,
            PageTemplateId,
            site: Constants.SXAHeadlessSite);
        if (response.Errors != null)
        {
            Assert.Fail("CreatePage response failed.");
        }

        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        Item item = responseData.createPage.item;

        if (item == null)
        {
            Assert.Fail("CreatePage item was null.");
        }
        TestData.PathsToDelete.Add(item.path);

        // Assert
        responseData.createPage.success.Should().BeTrue();
        item.name.Should().BeEquivalentTo(itemName);
        item.path.Should().BeEquivalentTo(HomePageItem.path + "/" + itemName);
        item.createdBy.Should().NotBeNull();
        item.language.Should().BeEquivalentTo("en");
        item.version.Should().Be(1);

        item.parent.name.Should().BeEquivalentTo("Home");
        item.parent.path.Should().BeEquivalentTo(HomePageItem.path);

        item.template.path.Should().BeEquivalentTo(Constants.TemplatePagePath);
    }

    [Test]
    public void CreatePage_ShouldReturnErrorOnEmptyPageName()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(string.Empty, HomePageItem.itemId, PageTemplateId, site: Constants.SXAHeadlessSite);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("InvalidItemName");
        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        responseData.createPage.Should().BeNull();
    }

    [Test]
    public void CreatePage_ShouldReturnErrorOnEmptyLanguage()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(
            Extensions.GetRandomName(),
            HomePageItem.itemId,
            PageTemplateId,
            language: string.Empty,
            site: Constants.SXAHeadlessSite);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("Language cannot be empty");
        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        responseData.createPage.Should().BeNull();
    }

    [Test]
    public void CreatePage_ShouldReturnErrorOnEmptySite()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(
            Extensions.GetRandomName(),
            HomePageItem.itemId,
            PageTemplateId,
            site: string.Empty);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("Site cannot be empty");
        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        responseData.createPage.Should().BeNull();
    }

    [Test]
    public void CreatePage_ShouldReturnErrorOnEmptyTemplateId()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(
            Extensions.GetRandomName(),
            HomePageItem.itemId,
            string.Empty,
            site: Constants.SXAHeadlessSite);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("InvalidTemplateId");
        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        responseData.createPage.Should().BeNull();
    }

    [Test]
    public void CreatePage_ShouldReturnErrorOnEmptyParentId()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.CreatePage(
            Extensions.GetRandomName(),
            string.Empty,
            PageTemplateId,
            site: Constants.SXAHeadlessSite);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("InvalidParent");
        CreateItemResponse responseData = JsonConvert.DeserializeObject<CreateItemResponse>(response.Data.ToString());
        responseData.createPage.Should().BeNull();
    }
}
