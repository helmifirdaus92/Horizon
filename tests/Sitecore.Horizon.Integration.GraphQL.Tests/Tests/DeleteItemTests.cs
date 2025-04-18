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

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class DeleteItemTests : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void RemovePage_PageShouldBeRemoved()
    {
        Item pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse deleteItemResponse = Context.ApiHelper.HorizonGraphQlClient.DeleteItem(pageItem.path, site: Constants.SXAHeadlessSite);
        DeleteItemResponse data = JsonConvert.DeserializeObject<DeleteItemResponse>(deleteItemResponse.Data.ToString());
        data.deleteItem.success.Should().BeTrue();
        Context.ApiHelper.PlatformGraphQlClient.GetItem(pageItem.path).Should().BeNull();
    }

    [Test]
    [Category("BITest")]
    public void RemoveFolderWhichHasSubpage_FolderAndPageShouldBeRemoved()
    {
        var folderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        var childItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), folderItem.itemId, PageTemplateId);
        TestData.Items.Add(folderItem);
        TestData.Items.Add(childItem);

        GraphQLResponse deleteItemResponse = Context.ApiHelper.HorizonGraphQlClient.DeleteItem(folderItem.path, site: Constants.SXAHeadlessSite);
        DeleteItemResponse data = JsonConvert.DeserializeObject<DeleteItemResponse>(deleteItemResponse.Data.ToString());
        data.deleteItem.success.Should().BeTrue();

        Context.ApiHelper.PlatformGraphQlClient.GetItem(folderItem.path).Should().BeNull();
        Context.ApiHelper.PlatformGraphQlClient.GetItem(childItem.path).Should().BeNull();
    }

    [Test]
    public void RemoveNotExistentItem_ShouldReturnNotFound()
    {
        GraphQLResponse deleteItemResponse = Context.ApiHelper.HorizonGraphQlClient.DeleteItem(Guid.NewGuid().ToString(), site: Constants.SXAHeadlessSite);
        DeleteItemResponse data = JsonConvert.DeserializeObject<DeleteItemResponse>(deleteItemResponse.Data.ToString());
        data.deleteItem.Should().BeNull();

        deleteItemResponse.Errors.Length.Should().Be(1);
        deleteItemResponse.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("ItemNotFound");
    }
}
