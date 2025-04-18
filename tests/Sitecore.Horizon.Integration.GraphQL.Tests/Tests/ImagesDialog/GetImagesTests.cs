// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
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
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public class GetImagesTests : BaseFixture
{
    [Test]
    public void GetImages_GetCreatedMediaItem()
    {
        Item image = ImagesDialogHelpers.UploadImage(
            "newImage",
            "jpg",
            Constants.MediaLibraryId,
            Constants.MediaLibraryPath,
            "some alt text :)",
            "en");

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaItem(image.path, site: Constants.SXAHeadlessSite);

        MediaItem deserializedResponse = JsonConvert.DeserializeObject<MediaItem>(response.Data.mediaItem.ToString());
        deserializedResponse.displayName.Should().Be(image.name);
        deserializedResponse.height.Should().Be(150);
        deserializedResponse.width.Should().Be(150);
        deserializedResponse.alt.Should().Be("some alt text :)");
    }

    [Test]
    public void GetImages_ErrorOnNotAMediaItem()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaItem(Constants.HomePagePath, site: Constants.SXAHeadlessSite);

        MediaItem deserializedResponse = JsonConvert.DeserializeObject<MediaItem>(response.Data.mediaItem.ToString());
        deserializedResponse.Should().BeNull();
        response.Errors.First().Message.Should().Be("NotAMedia");
    }

    [Test]
    public void GetImages_ErrorOnSourceNotFound()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(Constants.MediaLibraryPath, new List<string>()
        {
            "NotValidPath;'()_+"
        }, site: Constants.SXAHeadlessSite);

        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
        deserializedResponse.Should().BeNull();
        response.Errors.First().Message.Should().Be("SourceNotFound");
    }

    [Test]
    public void GetImages_ErrorOnRootNotFound()
    {
        Item folder1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("folder1", Constants.MediaLibraryId, Constants.FolderTemplateId);
        Item folder2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("folder2", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder1);
        TestData.Items.Add(folder2);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder1.path, new List<string>()
        {
            folder2.path
        }, site: Constants.SXAHeadlessSite);

        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
        deserializedResponse.Should().BeNull();
        response.Errors.First().Message.Should().Be("RootNotFound");
    }

    [Test]
    public void GetImages_ErrorOnInvalidRoot()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery("NotValidPath;'()_+", new List<string>(), site: Constants.SXAHeadlessSite);

        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
        deserializedResponse.Should().BeNull();
        response.Errors.First().Message.Should().Be("RootNotFound");
    }

    [Test]
    public void GetImages_DisplayNameIsReturnedIfExist()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderDisplayName", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image = ImagesDialogHelpers.UploadImage(
            "Image",
            "jpg",
            folder.itemId,
            folder.path,
            "some alt text :)",
            "en");
        image.SetFieldValue("__Display name", "DN_toCheck");

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), site: Constants.SXAHeadlessSite);

        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
        deserializedResponse.items.Count.Should().Be(1);
        deserializedResponse.items.First().displayName.Should().BeEquivalentTo("DN_toCheck");
    }

    [Test]
    public void GetImages_ResponseDetails()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("folder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        image2.AddVersion();
        image2.AddVersion();
        image2.SetFieldValue("__Display name", "DN_toCheck");

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.hasMoreItems.Should().BeFalse();
        deserializedResponse.items.Count.Should().Be(2);

        MediaItem item1 = deserializedResponse.items.Find(i => i.id == new Guid(image1.itemId).ToString());
        item1.Should().NotBeNull();
        item1.displayName.Should().BeEquivalentTo(image1.name);
        item1.url.Should().Contain(image1.itemId.ToUpper());
        item1.url.Should().Contain("vs=1");

        MediaItem item2 = deserializedResponse.items.Find(i => i.id == new Guid(image2.itemId).ToString());
        item2.Should().NotBeNull();
        item2.displayName.Should().BeEquivalentTo("DN_toCheck");
        item2.url.Should().Contain(image2.itemId.ToUpper());
        item2.url.Should().Contain("vs=3");
    }

    [Test]
    public void GetImages_ReturnImagesForAllLanguages()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("UnversionedImagesForAllLanguages", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        image1.AddVersion("da");
        image1.SetFieldValue("__Display name", "Image1DaLanguage", "da");
        Item image2 = ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        image2.AddVersion("da");
        image2.SetFieldValue("__Display Name", "Image2DaLanguage", "da");

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), language: "da", site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(2);
        deserializedResponse.items.Any(i => i.displayName == "Image1DaLanguage").Should().BeTrue();
        deserializedResponse.items.Any(i => i.displayName == "Image2DaLanguage").Should().BeTrue();
    }

    [Test]
    public void GetImages_ImagesFromAllSubfolders()
    {
        Item rootFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ImagesSomeRootFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(rootFolder);
        Item subFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("subFolder", rootFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(subFolder);
        Item subSubFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("subSubFolder", subFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(subSubFolder);

        ImagesDialogHelpers.UploadImage("image1", "jpg", rootFolder.itemId, rootFolder.path);
        ImagesDialogHelpers.UploadImage("image2", "jpg", subFolder.itemId, subFolder.path);
        ImagesDialogHelpers.UploadImage("image3", "jpg", subSubFolder.itemId, subSubFolder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(rootFolder.path, new List<string>(), site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(3);
    }

    [Test]
    public void GetImages_ReturnImagesOnly()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderWithNotImagesOnly", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);
        Item folderItem = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderWithImagesOnly", folder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(folderItem);
        Item page = Context.ApiHelper.PlatformGraphQlClient.CreateItem(Extensions.GetRandomName(), folder.itemId, PageTemplateId);
        TestData.Items.Add(page);
        Item image1 = ImagesDialogHelpers.UploadImage("image1", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("image2", "jpg", folder.itemId, folder.path);
        image1.SetFieldValue("Blob", "");

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(1);
        deserializedResponse.items.Any(i => i.id == new Guid(image2.itemId).ToString()).Should().BeTrue();
        deserializedResponse.items.Any(i => i.id == new Guid(image1.itemId).ToString()).Should().BeFalse();
    }
}
