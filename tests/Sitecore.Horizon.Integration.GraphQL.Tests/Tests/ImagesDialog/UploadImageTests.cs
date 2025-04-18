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

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Tests.ImagesDialog;

public class UploadImageTests : BaseFixture
{
    [Test]
    public void UploadImage()
    {
        GraphQLResponse uploadMediaResponse = Context.ApiHelper.HorizonGraphQlClient.UploadMedia("Image", "png", blob:
            Convert.ToBase64String(ImagesDialogHelpers.CreateImage(150, 150, "text")), Constants.MediaLibraryId, site: Constants.SXAHeadlessSite);
        UploadMediaResponse data = JsonConvert.DeserializeObject<UploadMediaResponse>(uploadMediaResponse.Data.uploadMedia.ToString());
        TestData.PathsToDelete.Add($"{Constants.MediaLibraryPath}{data.mediaItem.path}");

        data.success.Should().BeTrue();

        var image = data.mediaItem;
        image.Should().NotBeNull();
        image.extension.Should().BeEquivalentTo("png");
        image.height.Should().Be(150);
        image.width.Should().Be(150);
        image.parentId.Should().BeEquivalentTo(Constants.MediaLibraryId);
    }

    [Test]
    public void UploadImage_WrongExtension()
    {
        GraphQLResponse uploadMediaResponse = Context.ApiHelper.HorizonGraphQlClient.UploadMedia("name", "extension", blob:
            Convert.ToBase64String(ImagesDialogHelpers.CreateImage(150, 150, "text")), Constants.MediaLibraryId, site: Constants.SXAHeadlessSite);

        UploadMediaResponse data = JsonConvert.DeserializeObject<UploadMediaResponse>(uploadMediaResponse.Data.uploadMedia.ToString());
        data.Should().BeNull();
        uploadMediaResponse.Errors.First().Message.Should().BeEquivalentTo("InvalidExtension");
    }

    [Test]
    public void UploadImage_NotAMediaFile()
    {
        GraphQLResponse uploadMediaResponse = Context.ApiHelper.HorizonGraphQlClient.UploadMedia("name", "png", blob:
            "text", Constants.MediaLibraryId, site: Constants.SXAHeadlessSite);

        UploadMediaResponse data = JsonConvert.DeserializeObject<UploadMediaResponse>(uploadMediaResponse.Data.uploadMedia.ToString());
        data.Should().BeNull();
        uploadMediaResponse.Errors.First().Message.Should().BeEquivalentTo("NotAMedia");
    }

    [Test]
    public void UploadImage_DestinationFolderNotFound()
    {
        GraphQLResponse uploadMediaResponse = Context.ApiHelper.HorizonGraphQlClient.UploadMedia("name", "png", blob:
            Convert.ToBase64String(ImagesDialogHelpers.CreateImage(10, 10, "text")), Guid.NewGuid().ToString(), site: Constants.SXAHeadlessSite);

        UploadMediaResponse data = JsonConvert.DeserializeObject<UploadMediaResponse>(uploadMediaResponse.Data.uploadMedia.ToString());
        data.Should().BeNull();
        uploadMediaResponse.Errors.First().Message.Should().BeEquivalentTo("DestinationFolderNotFound");
    }
}
