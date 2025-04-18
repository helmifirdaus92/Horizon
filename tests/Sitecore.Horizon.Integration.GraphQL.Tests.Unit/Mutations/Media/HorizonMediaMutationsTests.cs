// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media;
using Sitecore.Horizon.Integration.GraphQL.Mutations.Media.UploadMedia;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Media.Models;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Mutations.Media
{
    public class HorizonMediaMutationsTests
    {
        [Theory]
        [AutoNData]
        internal void CreateMedia_ShouldReturnNewlyCreatedMediaItem(
            [Frozen] ISitecoreContext sitecoreContext,
            [Frozen] IHorizonMediaManager mediaManager,
            HorizonMediaMutations sut,
            MediaItem mediaItem
        )
        {
            // arrange
            UploadMediaInput input = new()
            {
                Language = "en",
                Site = "website",
                FileName = "file 1",
                Blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                Extension = "png"
            };

            mediaManager.Configure().CreateMedia(Arg.Is<UploadMediaModel>(m =>
                m.MediaId == input.MediaId
                && m.Extension == input.Extension
                && m.DestinationFolderId == input.DestinationFolderId
                && m.FileName == input.FileName
                && m.Language == Language.Parse(input.Language))
            ).Returns(mediaItem);

            // act
            var field = sut.ResolveFieldValue<UploadMediaResult>(
                "uploadMedia",
                c => c
                    .WithArg("input", input));

            // assert
            field.MediaItem.Should().Be(mediaItem);
            sitecoreContext.Received().SetQueryContext("en", "website");
        }

        [Theory, AutoNData]
        internal void CreateMedia_ShouldThrowExceptionOnInvalidBase64File(
            [Frozen] IHorizonMediaManager mediaManager,
            HorizonMediaMutations sut,
            MediaItem mediaItem)
        {
            // arrange
            UploadMediaInput input = new()
            {
                Language = "en",
                Site = "website",
                FileName = "file 1",
                Blob = "Invalid",
                Extension = "png"
            };

            mediaManager.Configure().CreateMedia(Arg.Any<UploadMediaModel>()).Returns(mediaItem);

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue("uploadMedia", c => c.WithArg("input", input)))
                .Should().Throw<HorizonGqlError>().WithErrorCode(MediaErrorCode.NotAMedia);
        }

        [Theory, AutoNData]
        internal void CreateMedia_ShouldThrowExceptionOnInvalidExtension(
            [Frozen] IHorizonMediaManager mediaManager,
            HorizonMediaMutations sut,
            MediaItem mediaItem)
        {
            // arrange
            UploadMediaInput input = new()
            {
                Language = "en",
                Site = "website",
                FileName = "file 1",
                Blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                Extension = "pdf"
            };

            mediaManager.Configure().CreateMedia(Arg.Any<UploadMediaModel>()).Returns(mediaItem);

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue("uploadMedia", c => c.WithArg("input", input)))
                .Should().Throw<HorizonGqlError>().WithErrorCode(MediaErrorCode.InvalidExtension);
        }

        [Theory]
        [AutoNData]
        internal void CreateMedia_ShouldRethrowGenericError(
            [Frozen] IHorizonMediaManager mediaManager,
            HorizonMediaMutations sut,
            MediaErrorCode mediaErrorCode
        )
        {
            // arrange
            UploadMediaInput input = new()
            {
                Language = "en",
                Site = "website",
                FileName = "file 1",
                Extension = "png",
                Blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
            };

            mediaManager.Configure().CreateMedia(Arg.Any<UploadMediaModel>()).Throws(new HorizonMediaException(mediaErrorCode));

            // act and assert
            sut.Invoking(s => s.ResolveFieldValue("uploadMedia", c => c.WithArg("input", input)))
                .Should().Throw<HorizonGqlError>().WithErrorCode(mediaErrorCode);
        }
    }
}
