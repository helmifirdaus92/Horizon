// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Extensions = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Extensions;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests;

public class GetItemTests : BaseFixture
{
    [Test]
    [Category("BITest")]
    public void GetHomePageItem_InDetails()
    {
        // Get Home page item
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetItem(Constants.HomePagePath, site: Constants.SXAHeadlessSite);
        Item homePageItem = JsonConvert.DeserializeObject<GetItemResponse>(response.Data.ToString()).item;

        // Assert
        homePageItem.name.Should().BeEquivalentTo("Home");
        homePageItem.displayName.Should().BeEquivalentTo("Home");
        homePageItem.path.Should().BeEquivalentTo(Constants.HomePagePath);
        homePageItem.createdBy.Should().NotBeNullOrEmpty();
        homePageItem.updatedBy.Should().NotBeNullOrEmpty();
        homePageItem.insertOptions.Any(d => d.displayName.Contains("Page")).Should().BeTrue();
        homePageItem.isLatestPublishableVersion.Should().BeTrue();
        homePageItem.language.Should().BeEquivalentTo("en");
        homePageItem.revision.Should().NotBeNullOrEmpty();
        homePageItem.version.Should().Be(1);
        homePageItem.versions.Count.Should().BeGreaterOrEqualTo(1);
        homePageItem.workflow.Should().BeNull();

        homePageItem.ancestors.Any(a => a.name == Constants.SXAHeadlessSite).Should().BeTrue();
        homePageItem.ancestors.Any(a => a.path == Constants.SXAHeadlessSiteItemPath).Should().BeTrue();
        homePageItem.parent.name.Should().BeEquivalentTo(Constants.SXAHeadlessSite);
        homePageItem.parent.path.Should().BeEquivalentTo(Constants.SXAHeadlessSiteItemPath);

        homePageItem.hasChildren.Should().BeTrue();
        homePageItem.children.Any(c => c.name == "About").Should().BeTrue();
        homePageItem.children.Any(c => c.path == Constants.AboutPagePath).Should().BeTrue();

        homePageItem.locking.canUnlock.Should().BeTrue();
        homePageItem.locking.isLocked.Should().BeFalse();
        homePageItem.locking.lockedByCurrentUser.Should().BeFalse();

        homePageItem.permissions.canCreate.Should().BeTrue();
        homePageItem.permissions.canDelete.Should().BeTrue();
        homePageItem.permissions.canPublish.Should().BeTrue();
        homePageItem.permissions.canRename.Should().BeTrue();
        homePageItem.permissions.canWrite.Should().BeTrue();

        homePageItem.publishing.hasPublishableVersion.Should().BeTrue();
        homePageItem.publishing.isAvailableToPublish.Should().BeTrue();
        homePageItem.publishing.isPublishable.Should().BeTrue();
        homePageItem.publishing.validFromDate.Should().NotBeNullOrEmpty();
        homePageItem.publishing.validToDate.Should().NotBeNullOrEmpty();
    }

    [Test]
    [Category("BITest")]
    public void GetNotExistedItem_ItemNotFoundReturned()
    {
        string randomId = Guid.NewGuid().ToString();
        GraphQLError error = Context.ApiHelper.HorizonGraphQlClient.GetItem(randomId, site: Constants.SXAHeadlessSite).Errors.FirstOrDefault();

        error.Message.Should().Be("ItemNotFound");
        error.AdditonalEntries.First(c => c.Key == "extensions").Value.First.First.Value<string>()
            .Should().BeEquivalentTo("ItemNotFound");
    }

    [Test]
    public void GetItemWithPresentation_ShouldReturnPage()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItem(pageItem.path, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.name.Should().BeEquivalentTo(pageItem.name);
        page.id.Replace("-", "").Should().BeEquivalentTo(pageItem.itemId);
    }

    [Test]
    [Category("BITest")]
    public void GetItemWith2VersionsAndPresentationByPath_ShouldReturnCorrectLanguageAndVersion()
    {
        var pageItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(pageItem.path, "da");
        Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(pageItem.path, "en");
        TestData.Items.Add(pageItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItem(pageItem.path, site: Constants.SXAHeadlessSite);
        Item page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.versions.Count.Should().Be(2);

        item = Context.ApiHelper.HorizonGraphQlClient.GetItem(pageItem.path, language: "da", site: Constants.SXAHeadlessSite);
        page = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        page.versions.Count.Should().Be(1);
    }

    [Test]
    [Category("BITest")]
    public void GetItemWithFolderTemplate_ShouldReturnFolder()
    {
        var folderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(folderItem);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItem(folderItem.path, site: Constants.SXAHeadlessSite);
        Item folder = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        folder.id.Replace("-", "").Should().BeEquivalentTo(folderItem.itemId);
        folder.name.Should().BeEquivalentTo(folderItem.name);
        folder.template.id.Should().BeEquivalentTo(Constants.FolderTemplateId);
    }

    [Test]
    [Category("BITest")]
    public void GetFolderWithSubPages()
    {
        var folderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, Constants.FolderTemplateId);
        var childFolderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), folderItem.itemId, Constants.FolderTemplateId);
        var page = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), folderItem.itemId, PageTemplateId);
        TestData.Items.Add(folderItem);
        TestData.Items.Add(childFolderItem);
        TestData.Items.Add(page);

        GraphQLResponse item = Context.ApiHelper.HorizonGraphQlClient.GetItem(folderItem.path, site: Constants.SXAHeadlessSite);
        Item folder = JsonConvert.DeserializeObject<GetItemResponse>(item.Data.ToString()).item;

        folder.id.Replace("-", "").Should().BeEquivalentTo(folderItem.itemId);
        folder.hasChildren.Should().BeTrue();
        folder.children.Count.Should().Be(2);
        var child = folder.children.Find(i => i.name == page.name);
        child.Should().NotBeNull();
        child.id.Replace("-", "").Should().BeEquivalentTo(page.itemId);
        child = folder.children.Find(i => i.name == childFolderItem.name);
        child.Should().NotBeNull();
        child.id.Replace("-", "").Should().BeEquivalentTo(childFolderItem.itemId);
    }

    [Test]
    [Category("BITest")]
    public void GetItem_CheckAncestors()
    {
        var page = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), HomePageItem.itemId, PageTemplateId);
        var childPage = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), page.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(page);
        TestData.Items.Add(childPage);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetItem(childPage.path, site: Constants.SXAHeadlessSite);
        Item item = JsonConvert.DeserializeObject<GetItemResponse>(response.Data.ToString()).item;

        item.ancestors.Count.Should().Be(3);
        item.ancestors.Find(i => i.name == page.name).Should().NotBeNull();
        item.ancestors.Find(i => i.name == HomePageItem.name).Should().NotBeNull();
    }

    [Test]
    public void GetItem_PathPathIsEmpty_ShouldReturnError()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetItem(string.Empty, site: Constants.SXAHeadlessSite);
        response.Errors.Length.Should().Be(1);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("Argument should be not empty: path");
        Item item = JsonConvert.DeserializeObject<GetItemResponse>(response.Data.ToString()).item;
        item.Should().BeNull();
    }

    [Test]
    public void GetItem_SiteIsEmpty_ShouldReturnError()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetItem(Guid.NewGuid().ToString(), site: string.Empty);
        response.Errors.Length.Should().Be(1);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("Argument should be not empty: site");
        Item item = JsonConvert.DeserializeObject<GetItemResponse>(response.Data.ToString()).item;
        item.Should().BeNull();
    }

    [Test]
    public void GetItem_LanguageIsEmpty_ShouldReturnError()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetItem(Guid.NewGuid().ToString(), language: string.Empty, site: Constants.SXAHeadlessSite);
        response.Errors.Length.Should().Be(1);
        response.Errors.FirstOrDefault().Message.Should().BeEquivalentTo("Argument should be not empty: language");
        Item item = JsonConvert.DeserializeObject<GetItemResponse>(response.Data.ToString()).item;
        item.Should().BeNull();
    }
}
