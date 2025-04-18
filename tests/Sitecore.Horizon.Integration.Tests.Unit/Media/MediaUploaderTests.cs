// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.IO;
using System.Text;
using AutoFixture;
using AutoFixture.Xunit2;
using FluentAssertions;
using NSubstitute;
using NSubstitute.ExceptionExtensions;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Exceptions;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture;
using Sitecore.NSubstituteUtils;
using Sitecore.Resources.Media;
using Sitecore.Security.Accounts;
using Xunit;
using MediaUploader = Sitecore.Horizon.Integration.Media.MediaUploader;
using SysConvert = System.Convert;

namespace Sitecore.Horizon.Integration.Tests.Unit.Media
{
    public class MediaUploaderTests
    {
        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldCreateItemFromStreamAndReturnCreatedItem([Frozen] IMediaCreatorWrapper mediaCreator,
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker, MediaUploader sut,
            UploadMediaModel media,
            Item destinationItem,
            Item item)
        {
            // arrange
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.Blob = SysConvert.FromBase64String(blob);
            media.MediaId = string.Empty;
            using var stream = new MemoryStream(media.Blob);
            mediaCreator.CreateItemFromStream(Arg.Is<MemoryStream>(x => x.Length == stream.Length),
                $"{media.FileName}.{media.Extension}", Arg.Any<MediaCreatorOptions>()).Returns(item);
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            result.InnerItem.Should().Be(item);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldCreateItemFromStreamWithCorrectFileAndOptions(
            [Frozen] ISitecoreContext scContext,
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media,
            Item destinationItem,
            Item item)
        {
            // arrange
            string uploadFileName = "cat picture";
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.Blob = SysConvert.FromBase64String(blob);
            media.FileName = uploadFileName;
            media.MediaId = string.Empty;

            using var stream = new MemoryStream(media.Blob);
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), Any.String, Arg.Any<MediaCreatorOptions>()).Returns(item);
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            mediaCreator.Received().CreateItemFromStream(Arg.Any<MemoryStream>(), $"{uploadFileName}.{media.Extension}",
                Arg.Is<MediaCreatorOptions>(o => o.Language == media.Language
                    && o.AlternateText == uploadFileName
                    && o.Database == scContext.Database
                    && o.Destination.Contains(uploadFileName)));
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldContainFolderPathAsDestination(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media,
            Item item,
            Item folderItem,
            string folderPath)
        {
            // arrange
            media.MediaId = string.Empty;
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.Blob = SysConvert.FromBase64String(blob);
            using var stream = new MemoryStream(media.Blob);
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), Any.String, Arg.Any<MediaCreatorOptions>()).Returns(item);
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(folderItem);
            folderItem.Paths.FullPath.Returns(folderPath);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            mediaCreator.Received().CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}",
                Arg.Is<MediaCreatorOptions>(o => o.Destination.Contains(folderPath)));
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldContainMediaParentAsDestinationIfMediaIdSpecified(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media,
            Item item,
            FakeItem mediaItem,
            FakeItem parentItem,
            FakeItem destinationItem,
            string mediaItemParentPath)
        {
            // arrange
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.Blob = SysConvert.FromBase64String(blob);
            using var stream = new MemoryStream(media.Blob);
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), Any.String, Arg.Any<MediaCreatorOptions>()).Returns(item);

            parentItem.WithPath(mediaItemParentPath);
            mediaItem.WithParent(parentItem);
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemHelper.GetItem(media.MediaId, ItemScope.MediaOnly).Returns(mediaItem);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            mediaCreator.Received().CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}",
                Arg.Is<MediaCreatorOptions>(o => o.Destination.Contains(mediaItemParentPath)));
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldUseMediaLibraryIfDestinationFolderNotProvided(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media,
            Item item,
            FakeItem mediaItem,
            FakeItem parentItem,
            FakeItem destinationItem,
            string mediaItemParentPath)
        {
            // arrange
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.Blob = SysConvert.FromBase64String(blob);
            media.DestinationFolderId = string.Empty;
            using var stream = new MemoryStream(media.Blob);
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), Any.String, Arg.Any<MediaCreatorOptions>()).Returns(item);

            parentItem.WithPath(mediaItemParentPath);
            mediaItem.WithParent(parentItem);
            itemHelper.GetItem(Constants.MediaLibraryPath, ItemScope.MediaOnly).Returns(destinationItem);
            itemHelper.GetItem(media.MediaId, ItemScope.MediaOnly).Returns(mediaItem);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            mediaCreator.Received().CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}",
                Arg.Is<MediaCreatorOptions>(o => o.Destination.Contains(mediaItemParentPath)));
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldChangeFileNameIfFileWithSameNameAlreadyExist(
            [Frozen] IHorizonItemHelper itemHelper,
            [Frozen] IItemPermissionChecker itemPermissionChecker,
            [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media,
            Item item,
            FakeItem mediaItem,
            FakeItem childItem)
        {
            // arrange
            string uploadFileName = "cat picture";
            string expectedFileName = "cat picture1";
            string blob = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
            media.FileName = uploadFileName;
            media.Blob = SysConvert.FromBase64String(blob);
            media.MediaId = string.Empty;
            using var stream = new MemoryStream(SysConvert.FromBase64String(blob));
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), uploadFileName, Arg.Any<MediaCreatorOptions>()).Returns(item);

            childItem.WithName(uploadFileName);
            mediaItem.WithChild(childItem);
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(mediaItem);
            itemPermissionChecker.CanWrite(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act
            MediaItem result = sut.CreateMedia(media);

            // assert
            mediaCreator.Received().CreateItemFromStream(Arg.Any<MemoryStream>(), $"{uploadFileName}.{media.Extension}",
                Arg.Is<MediaCreatorOptions>(o => o.Destination.Contains(expectedFileName)));
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldThrowExceptionIfUnableToCreateMediaFromStream([Frozen] BaseLog logger, [Frozen] IHorizonItemHelper itemHelper, [Frozen] IItemPermissionChecker itemPermissionChecker, [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media, FakeItem destinationItem)
        {
            // arrange
            media.MediaId = string.Empty;
            media.Blob = SysConvert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}", Arg.Any<MediaCreatorOptions>()).Throws<InvalidOperationException>();
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemPermissionChecker.CanWrite(destinationItem, Arg.Any<User>()).ReturnsTrue();

            // act and assert
            sut.Invoking(s => s.CreateMedia(media))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.GenericError);
            logger.Received().Error("Unable to create media from stream", Arg.Any<InvalidOperationException>(), Any.Object);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldThrowInsufficientPrivilegesExceptionIfNoWritePermissionOnDestinationFolder([Frozen] IHorizonItemHelper itemHelper, [Frozen] IItemPermissionChecker itemPermissionChecker, [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media, FakeItem destinationItem)

        {
            // arrange
            media.Blob = SysConvert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}", Arg.Any<MediaCreatorOptions>()).Throws<InvalidOperationException>();
            media.MediaId = string.Empty;
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemPermissionChecker.CanWrite(destinationItem, Arg.Any<User>()).ReturnsFalse();

            // act and assert
            sut.Invoking(s => s.CreateMedia(media))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.InsufficientPrivileges);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldThrowDestinationFolderNotFoundExceptionIfDestinationFolderNotFound([Frozen] IHorizonItemHelper itemHelper, [Frozen] IItemPermissionChecker itemPermissionChecker, [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
            UploadMediaModel media, FakeItem destinationItem)

        {
            // arrange
            media.Blob = SysConvert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}", Arg.Any<MediaCreatorOptions>()).Throws<InvalidOperationException>();
            media.MediaId = string.Empty;
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(null as Item);
            itemPermissionChecker.CanWrite(destinationItem, Arg.Any<User>()).ReturnsFalse();

            // act and assert
            sut.Invoking(s => s.CreateMedia(media))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.DestinationFolderNotFound);
        }

        [Theory, AutoNData]
        [CustomizeFixture(typeof(StableHorizonItemHelper))]
        internal void CreateMedia_ShouldThrowSvgCannotBeUploadedExceptionIfFileContainsJavascriptCode([Frozen] IHorizonItemHelper itemHelper, [Frozen] IItemPermissionChecker itemPermissionChecker, [Frozen] IMediaCreatorWrapper mediaCreator, MediaUploader sut,
           UploadMediaModel media, FakeItem destinationItem)

        {
            // arrange
            string svgContent = "<svg onclick='alert(1)'></svg>";
            string escapedSvgContent = svgContent.Replace("'", "\\'").Replace("=", "\\=");
            string base64EncodedSvg = SysConvert.ToBase64String(Encoding.UTF8.GetBytes(escapedSvgContent));

            media.Blob = SysConvert.FromBase64String(base64EncodedSvg);
            mediaCreator.CreateItemFromStream(Arg.Any<MemoryStream>(), $"{media.FileName}.{media.Extension}", Arg.Any<MediaCreatorOptions>()).Throws<SvgCannotBeUploadedException>();
            media.MediaId = string.Empty;
            itemHelper.GetItem(media.DestinationFolderId, ItemScope.MediaOnly).Returns(destinationItem);
            itemPermissionChecker.CanWrite(destinationItem, Arg.Any<User>()).ReturnsTrue();

            // act and assert
            sut.Invoking(s => s.CreateMedia(media))
                .Should().Throw<HorizonMediaException>().Which.ErrorCode.Should().Be(MediaErrorCode.SvgScriptsNotAllowed);
        }

        public class StableHorizonItemHelper : ICustomization
        {
            public void Customize(IFixture fixture)
            {
                var itemHelper = fixture.Freeze<IHorizonItemHelper>();
                var db = fixture.Create<Database>();

                itemHelper.GetItem(Any.ID, Arg.Any<ItemScope>()).Returns(c => db.GetItem(c.Arg<ID>()));
                itemHelper.GetItem(Any.String, Arg.Any<ItemScope>()).Returns(c => db.GetItem(c.Arg<string>()));
            }
        }
    }
}
