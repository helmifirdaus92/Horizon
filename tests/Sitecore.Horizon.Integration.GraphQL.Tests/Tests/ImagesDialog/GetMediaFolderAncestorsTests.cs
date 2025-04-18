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
using Constants = Sitecore.Horizon.Integration.GraphQL.Tests.Helpers.Constants;
using Item = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types.Item;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public class GetMediaFolderAncestorsTests : BaseFixture
{
    [Test]
    public void GetMediaFolderAncestors_GetParentAndSiblings()
    {
        var expectedAncestors = new List<string>();

        //folders tree
        Item parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ParentFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);

        Item f1 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F1", parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f1);
        expectedAncestors.Add(f1.name);

        Item f11 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F11", f1.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f11);

        Item f2 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F2", parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f2);
        expectedAncestors.Add(f2.name);

        Item f21 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F21", f2.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f21);
        expectedAncestors.Add(f21.name);

        Item f22 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F22", f2.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f22);
        expectedAncestors.Add(f22.name);

        Item f221 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F221", f22.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f221);
        expectedAncestors.Add(f221.name);

        Item f2211 = Context.ApiHelper.PlatformGraphQlClient.CreateItem("F2211", f221.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(f2211);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors(f22.path, new List<string>()
        {
            parentFolder.path
        }, site: Constants.SXAHeadlessSite);

        var ancestors = JsonConvert.DeserializeObject<List<MediaFolderItem>>(response.Data.mediaFolderAncestors.ToString());
        CheckExpectedMediaFolderItemAncestorsExistInResponse(ancestors, expectedAncestors);
    }

    [Test]
    public void GetMediaFolderAncestors_InvalidPath()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors("/sitecore/notexisting", new List<string>(), site: Constants.SXAHeadlessSite);

        GetMediaFolderAncestorsResponse ancestors = JsonConvert.DeserializeObject<GetMediaFolderAncestorsResponse>(response.Data.ToString());
        ancestors.mediaFolderAncestors.Should().BeNull();
        response.Errors.First().Message.Should().Be("NotFound");
    }

    [Test]
    public void GetMediaFolderAncestors_NotFolderPath()
    {
        Item imageItem = ImagesDialogHelpers.UploadImage("image", "jpg", Constants.MediaLibraryId, Constants.MediaLibraryPath);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors(imageItem.path, new List<string>(), site: Constants.SXAHeadlessSite);

        GetMediaFolderAncestorsResponse ancestors = JsonConvert.DeserializeObject<GetMediaFolderAncestorsResponse>(response.Data.ToString());
        ancestors.mediaFolderAncestors.Should().BeNull();
        response.Errors.First().Message.Should().Be("NotAFolder");
    }

    [Test]
    public void GetMediaFolderAncestors_InvalidSource()
    {
        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors(Constants.MediaLibraryId, new List<string>()
        {
            "/sitecore/notexisting"
        }, site: Constants.SXAHeadlessSite);

        GetMediaFolderAncestorsResponse ancestors = JsonConvert.DeserializeObject<GetMediaFolderAncestorsResponse>(response.Data.ToString());
        ancestors.mediaFolderAncestors.Should().BeNull();
        response.Errors.First().Message.Should().Be("SourceNotFound");
    }

    [Test]
    public void GetMediaFolderAncestors_NotFolderSource()
    {
        Item imageItem = ImagesDialogHelpers.UploadImage("image", "jpg", Constants.MediaLibraryId, Constants.MediaLibraryPath);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors(Constants.MediaLibraryPath, new List<string>()
        {
            imageItem.path
        }, site: Constants.SXAHeadlessSite);

        GetMediaFolderAncestorsResponse ancestors = JsonConvert.DeserializeObject<GetMediaFolderAncestorsResponse>(response.Data.ToString());
        ancestors.mediaFolderAncestors.Should().BeNull();
        response.Errors.First().Message.Should().Be("SourceNotReachable");
    }

    [Test]
    public void GetMediaFolderAncestors_RetrieveDisplayNameBasedOnLanguage()
    {
        var expectedAncestors = new List<string>();

        //parent folder
        Item parentFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("ParentFolder", Constants.MediaLibraryId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        expectedAncestors.Add(parentFolder.name);

        // folder danish and english displayName
        Item daFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("DaFolder", parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(parentFolder);
        daFolder.SetFieldValue("__Display name", "English Display Name");
        daFolder.AddVersion("da");
        daFolder.SetFieldValue("__Display name", "Danish Display Name", "da");
        expectedAncestors.Add("Danish Display Name");

        // en folder
        Item enFolder = Context.ApiHelper.PlatformGraphQlClient.CreateItem("EnFolder", parentFolder.itemId, Constants.FolderTemplateId);
        TestData.Items.Add(enFolder);
        enFolder.AddVersion();
        expectedAncestors.Add(enFolder.name);

        GraphQLResponse response = Context.ApiHelper.HorizonGraphQlClient.GetMediaFolderAncestors(daFolder.path, new List<string>()
        {
            parentFolder.path
        }, "da", Constants.SXAHeadlessSite);

        List<MediaFolderItem> ancestors = JsonConvert.DeserializeObject<List<MediaFolderItem>>(response.Data.mediaFolderAncestors.ToString());
        CheckExpectedMediaFolderItemAncestorsExistInResponse(ancestors, expectedAncestors);
    }

    private void CheckExpectedMediaFolderItemAncestorsExistInResponse(List<MediaFolderItem> ancestors, List<string> expectedAncestors)
    {
        ancestors.Count.Should().Be(expectedAncestors.Count, "Expect same number of folders");
        foreach (var expectedDisplayName in expectedAncestors)
        {
            ancestors.Exists(c => c.displayName == expectedDisplayName).Should().BeTrue("Created folders to be returned");
        }
    }
}
