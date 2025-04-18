// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public class GetFoldersTreeTests : BaseFixture
{
    [Test]
    public void GetMediaFolderItem_ShowCommonFoldersAndInheritedItems()
    {
        List<string> expectedChildren = new();

        //parent folder
        Item requestedRootFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ParentFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(requestedRootFolder);

        // 2 normal folders
        Item commonFolder1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("CommonFolder1", requestedRootFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(commonFolder1);
        Item commonFolder2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("CommonFolder2", requestedRootFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(commonFolder1);

        expectedChildren.Add(commonFolder1.name);
        expectedChildren.Add(commonFolder2.name);

        // 2 folders from custom template inherited from Common folder template
        CreateItemTemplateResponse templateInheritedFromCommonFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate("InheritedTemplate", Constants.FolderTemplateId, new List<string>()
        {
            Constants.FolderTemplateId
        });
        TestData.PathsToDelete.Add($"{Constants.FolderTemplatePath}/{templateInheritedFromCommonFolder.createItemTemplate.itemTemplate.name}");
        Item itemInheritedFromCommonFolder1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderInheritedFromCommonFolder1", requestedRootFolder.itemId, templateInheritedFromCommonFolder.createItemTemplate.itemTemplate.templateId);
        TestData.Items.Add(itemInheritedFromCommonFolder1);
        expectedChildren.Add("FolderInheritedFromCommonFolder1");
        Item itemInheritedFromCommonFolder2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderInheritedFromCommonFolder2", requestedRootFolder.itemId, templateInheritedFromCommonFolder.createItemTemplate.itemTemplate.templateId);
        TestData.Items.Add(itemInheritedFromCommonFolder2);
        expectedChildren.Add("FolderInheritedFromCommonFolder2");

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderItem(requestedRootFolder.path, site: Constants.SXAHeadlessSite);

        MediaFolderItem folder = JsonConvert.DeserializeObject<MediaFolderItem>(response.Data.mediaFolderItem.ToString());
        CheckExpectedMediaFolderItemChildrenExistInResponse(folder, expectedChildren);
    }

    [Test]
    public void GetMediaFolderItem_HandleInvalidPath()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderItem("NotAValidPath", site: Constants.SXAHeadlessSite);

        MediaFolderItem folder = JsonConvert.DeserializeObject<MediaFolderItem>(response.Data.mediaFolderItem.ToString());
        folder.Should().BeNull();
        response.Errors.First().Message.Should().Be("NotFound");
    }

    [Test]
    public void GetMediaFolderItem_OnlyFoldersCanBeSpecifiedAsRootPath()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderItem(Constants.HomePagePath, site: Constants.SXAHeadlessSite);

        MediaFolderItem folder = JsonConvert.DeserializeObject<MediaFolderItem>(response.Data.mediaFolderItem.ToString());
        folder.Should().BeNull();
        response.Errors.First().Message.Should().Be("NotFound");
    }

    [Test]
    public void GetMediaFolderItem_ReturnFoldersItemsWithDifferentLanguageVersions()
    {
        List<string> expectedChildren = new();

        //parent folder
        Item requestedRootFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ParentMediaFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(requestedRootFolder);

        // folder with only Danish language and few versions
        Item daFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("DaFolder", requestedRootFolder.itemId, Constants.FolderTemplateId, language: "da");
        TestData.Items.Add(daFolder);
        daFolder.AddVersion("da");
        daFolder.AddVersion("da");
        expectedChildren.Add(daFolder.name);

        // en folder with few versions
        Item enFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("EnFolder", requestedRootFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(enFolder);
        enFolder.AddVersion("en");
        expectedChildren.Add(enFolder.name);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderItem(requestedRootFolder.path, site: Constants.SXAHeadlessSite);

        MediaFolderItem folder = JsonConvert.DeserializeObject<MediaFolderItem>(response.Data.mediaFolderItem.ToString());
        CheckExpectedMediaFolderItemChildrenExistInResponse(folder, expectedChildren);
    }

    [Test]
    public void GetMediaFolderItem_RetrieveDisplayNameBasedOnLanguage()
    {
        List<string> expectedChildren = new();

        Item requestedRootFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ParentMediaFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(requestedRootFolder);

        // folder danish and english display name
        Item daFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("DaFolder", requestedRootFolder.itemId, Constants.FolderTemplateId, language: "da");
        TestData.Items.Add(daFolder);
        daFolder.SetFieldValue("__Display name", "English Display Name", "en");
        daFolder.AddVersion("da");
        daFolder.SetFieldValue("__Display name", "Danish Display Name", "da");
        expectedChildren.Add("Danish Display Name");

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderItem(requestedRootFolder.path, "da", site: Constants.SXAHeadlessSite);

        MediaFolderItem folder = JsonConvert.DeserializeObject<MediaFolderItem>(response.Data.mediaFolderItem.ToString());
        CheckExpectedMediaFolderItemChildrenExistInResponse(folder, expectedChildren);
    }

    private void CheckExpectedMediaFolderItemChildrenExistInResponse(MediaFolderItem folder, List<string> expectedMediaFolderItemChildren)
    {
        folder.children.Count.Should().Be(expectedMediaFolderItemChildren.Count, "Expect same number of folders");
        foreach (var expectedDisplayName in expectedMediaFolderItemChildren)
        {
            folder.children.Exists(c => c.displayName == expectedDisplayName).Should().BeTrue("Created folders to be returned");
        }
    }
}
