// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection.Metadata;
using System.Xml.Linq;
using FluentAssertions;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using NUnit.Framework;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public class SearchImagesTests : BaseFixture
{
    [Test]
    public void SearchImages_SearchQueryDoesNotMatchAnyImage()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("NoMatchForAnyImage", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        ImagesDialogHelpers.UploadImage("Image3", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(Constants.MediaLibraryPath, new List<string>(), "imageNoMatchQuery", site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(0);
    }

    [Test]
    public void SearchImages_SearchHitsAreOutsideOfProvidedPath()
    {
        Item folder1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderWithImagesWhichSatisfySearch", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder1);

        Item image1 = ImagesDialogHelpers.UploadImage("image1", "jpg", folder1.itemId, folder1.path);
        Item image2 = ImagesDialogHelpers.UploadImage("image2", "jpg", folder1.itemId, folder1.path);
        Item image3 = ImagesDialogHelpers.UploadImage("image3", "jpg", folder1.itemId, folder1.path);

        List<Item> images = new()
        {
            image1,
            image2,
            image3
        };

        Item folder2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("FolderOutside", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder2);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder2.path, new List<string>(), "image", site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
        deserializedResponse.items.Count.Should().Be(0);

        response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder1.path, new List<string>(), "image", site: Constants.SXAHeadlessSite);
        deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(3);
        images.All(image => deserializedResponse.items.Any(i => i.id == new Guid(image.itemId).ToString())).Should().BeTrue();
    }

    [Test]
    public void SearchImages_SearchCriteriaIsEmpty()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesEmptySearchCriteria", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("image1", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("image2", "jpg", folder.itemId, folder.path);
        Item image3 = ImagesDialogHelpers.UploadImage("image3", "jpg", folder.itemId, folder.path);

        List<Item> images = new()
        {
            image1,
            image2,
            image3
        };

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), "", site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(3);
        images.All(image => deserializedResponse.items.Any(i => i.id == new Guid(image.itemId).ToString())).Should().BeTrue();
    }

    [Test]
    public void SearchImages_BaseTemplatesNotImages()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("BaseTemplatesNotImages", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        ImagesDialogHelpers.UploadImage("image1", "jpg", folder.itemId, folder.path);
        ImagesDialogHelpers.UploadImage("image2", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), baseTemplateIds: new List<string>() { Guid.NewGuid().ToString() }, site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.Should().BeNull();
    }

    [Test]
    public void SearchImages_BaseTemplatesCovered()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("BaseTemplatesCovered", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("image1", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("image2", "jpg", folder.itemId, folder.path);

        List<Item> images = new()
        {
            image1,
            image2
        };

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), baseTemplateIds: new List<string>() { "F1828A2C-7E5D-4BBD-98CA-320474871548" }, site: Constants.SXAHeadlessSite);
        MediaQueryResponse deserializedResponse = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());

        deserializedResponse.items.Count.Should().Be(images.Count);
        images.All(image => deserializedResponse.items.Any(i => i.id == new Guid(image.itemId).ToString())).Should().BeTrue();
    }

    [TestCase("*Image*", 3)]
    [TestCase("*Image*3", 1)]
    [TestCase("*First*Image*Name", 1)]
    [TestCase("*name3", 1)]
    [TestCase(" second", 1)]
    public void SearchImages_SearchUsingWildcards(string searchQuery, int expectedHitsNumber)
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesWildCards", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("FirstImageName1", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("SecondImageName2", "jpg", folder.itemId, folder.path);
        Item image3 = ImagesDialogHelpers.UploadImage("ThirdImageName3", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), searchQuery, site: Constants.SXAHeadlessSite);
        List<Item> items = JsonConvert.DeserializeObject<List<Item>>(response.Data.mediaQuery.items.ToString());

        items.Count.Should().Be(expectedHitsNumber);
        searchQuery.Split('*').All(word => items.First().displayName.ToLower().Contains(word.ToLower().Trim())).Should().BeTrue();
    }

    [Test]
    public void SearchImages_SearchAmongItemNames()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesItemName", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("FirstImage", "jpg", folder.itemId, folder.path);
        Item image2 = ImagesDialogHelpers.UploadImage("SecondImage", "jpg", folder.itemId, folder.path);
        Item image3 = ImagesDialogHelpers.UploadImage("ThirdImage", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), "Second", site: Constants.SXAHeadlessSite);
        List<Item> items = JsonConvert.DeserializeObject<List<Item>>(response.Data.mediaQuery.items.ToString());

        items.Count.Should().Be(1);
        items.First().displayName.Should().Be(image2.name);
    }

    [Test]
    public void SearchImages_SearchAmongDisplayNames()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesDisplayName", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        image1.SetFieldValue("__Display name", "DisplayNameOfFirstImage");
        Item image2 = ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        image2.SetFieldValue("__Display name", "DisplayNameOfSecondImage");
        Item image3 = ImagesDialogHelpers.UploadImage("Image3", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), "DisplayNameOfSecond", site: Constants.SXAHeadlessSite);
        List<Item> items = JsonConvert.DeserializeObject<List<Item>>(response.Data.mediaQuery.items.ToString());

        items.Count.Should().Be(1);
        items.First().displayName.Should().Be("DisplayNameOfSecondImage");
    }

    [Test]
    public void SearchImages_SearchAmongAltText()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesDisplayName", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        image1.SetFieldValue("Alt", "altTextOfFirstImage");
        Item image2 = ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        image2.SetFieldValue("Alt", "altTextOfSecondImage");
        Item image3 = ImagesDialogHelpers.UploadImage("Image3", "jpg", folder.itemId, folder.path);

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), "altTextOfSecond", site: Constants.SXAHeadlessSite);
        List<Item> items = JsonConvert.DeserializeObject<List<Item>>(response.Data.mediaQuery.items.ToString());

        items.Count.Should().Be(1);
        items.First().displayName.Should().Be(image2.displayName);
    }

    [Test]
    public void SearchImages_SearchAcrossDifferentLanguages()
    {
        Item folder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("SearchImagesDisplayName", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(folder);

        Item image1 = ImagesDialogHelpers.UploadImage("Image1", "jpg", folder.itemId, folder.path);
        image1.AddVersion("da");
        image1.SetFieldValue("__Display name", "DisplayNameOfFirstImageDaLanguage", "da");
        Item image2 = ImagesDialogHelpers.UploadImage("Image2", "jpg", folder.itemId, folder.path);
        image2.AddVersion("da");
        image2.SetFieldValue("__Display name", "MatchedDisplayNameOfSecondImageDaLanguage", "da");
        Item image3 = ImagesDialogHelpers.UploadImage("Image3", "jpg", folder.itemId, folder.path);
        image3.SetFieldValue("__Display name", "MatchedDisplayNameOfSecondImageDaLanguage", "en");

        ImagesDialogHelpers.WaitForImagesToBeIndexed();

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.MediaQuery(folder.path, new List<string>(), "Matched", "da", site: Constants.SXAHeadlessSite);
        List<Item> items = JsonConvert.DeserializeObject<List<Item>>(response.Data.mediaQuery.items.ToString());

        items.Count.Should().Be(2);
        items.Any(i => i.displayName == "MatchedDisplayNameOfSecondImageDaLanguage").Should().BeTrue();
        items.Any(i => i.displayName == image3.name).Should().BeTrue();
    }
}
