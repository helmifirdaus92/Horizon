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
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.PageDesigning;

public class GetRawItem : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void GetRawItem_PageWithSubpages()
    {
        // Arrange
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        var folderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), pageItem.itemId, Constants.FolderTemplateId);
        var subpage1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), pageItem.itemId, PageTemplateId);
        var subpage2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), folderItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        TestData.Items.Add(folderItem);
        TestData.Items.Add(subpage1);
        TestData.Items.Add(subpage2);

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            pageItem.path,
            site: Constants.SXAHeadlessSite);
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        var rawItem = itemResponse.rawItem;

        // Assert
        rawItem.hasChildren.Should().BeTrue();
        var children = rawItem.children;
        children.Count.Should().Be(2);
        var folder = children.Find(i => i.name == folderItem.name);
        folder.Should().NotBeNull();
        folder.id.Should().BeEquivalentTo(new Guid(folderItem.itemId).ToString());
        folder.hasChildren.Should().BeTrue();
        folder.children.Count.Should().Be(1);
        folder.children.First().id.Should().BeEquivalentTo(new Guid(subpage2.itemId).ToString());
        var subpage = children.Find(i => i.name == subpage1.name);
        subpage.Should().NotBeNull();
        subpage.id.Should().BeEquivalentTo(new Guid(subpage1.itemId).ToString());
        subpage.hasChildren.Should().BeFalse();
    }

    [Test]
    public void GetRawItem_ErrorOnWrongPath()
    {
        // Arrange & Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            Guid.NewGuid().ToString(),
            site: Constants.SXAHeadlessSite);

        // Assert
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        itemResponse.rawItem.Should().BeNull();
        response.Errors.Length.Should().BeGreaterOrEqualTo(1);
        response.Errors.First().Message.Should().Be("ItemNotFound");
    }

    [Test]
    [Category("BITest")]
    public void GetRawItem_LanguageVersion()
    {
        // Arrange
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.AddVersion("da");

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            pageItem.path,
            language: "da",
            site: Constants.SXAHeadlessSite);
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        var rawItem = itemResponse.rawItem;

        // Assert
        rawItem.language.Should().BeEquivalentTo("da");
        rawItem.version.Should().Be(1);
    }

    [Test]
    [Category("BITest")]
    public void GetRawItem_MultipleVersions()
    {
        // Arrange
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);
        pageItem.AddVersion("en");

        // Act
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetRawItem(
            pageItem.path,
            site: Constants.SXAHeadlessSite);
        GetRawItemResponse itemResponse = JsonConvert.DeserializeObject<GetRawItemResponse>(response.Data.ToString());
        var rawItem = itemResponse.rawItem;

        // Assert
        rawItem.language.Should().BeEquivalentTo("en");
        rawItem.version.Should().Be(2);
    }
}
