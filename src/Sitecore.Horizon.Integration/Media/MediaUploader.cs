// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Exceptions;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.Resources.Media;
using Sitecore.SecurityModel;

namespace Sitecore.Horizon.Integration.Media
{
    internal class MediaUploader : IMediaUploader
    {
        private readonly ISitecoreContext _scContext;
        private readonly MediaSettings _mediaSettings;
        private readonly IMediaCreatorWrapper _mediaCreator;
        private readonly IHorizonItemHelper _horizonItemHelper;
        private readonly BaseLog _logger;
        private readonly IItemPermissionChecker _itemPermissionChecker;

        public MediaUploader(BaseSettings baseSettings, BaseFactory baseFactory, ISitecoreContext scContext,
            IHorizonItemHelper horizonItemHelper, IItemPermissionChecker itemPermissionChecker, IMediaCreatorWrapper mediaCreator, BaseLog logger)
        {
            Assert.ArgumentNotNull(baseSettings, nameof(baseSettings));
            Assert.ArgumentNotNull(baseFactory, nameof(baseFactory));
            Assert.ArgumentNotNull(scContext, nameof(scContext));
            Assert.ArgumentNotNull(horizonItemHelper, nameof(horizonItemHelper));
            Assert.ArgumentNotNull(itemPermissionChecker, nameof(itemPermissionChecker));
            Assert.ArgumentNotNull(mediaCreator, nameof(mediaCreator));

            _mediaSettings = new MediaSettings(baseSettings);
            _mediaCreator = mediaCreator;
            _horizonItemHelper = horizonItemHelper;
            _itemPermissionChecker = itemPermissionChecker;
            _scContext = scContext;
            _logger = logger;
        }

        public MediaItem CreateMedia(UploadMediaModel uploadMedia)
        {
            Assert.ArgumentNotNull(uploadMedia, nameof(uploadMedia));

            MediaCreatorOptions mediaOptions = GenerateMediaOptions(uploadMedia.MediaId, uploadMedia.DestinationFolderId, uploadMedia.FileName, uploadMedia.Language);

            Item? destination = _horizonItemHelper.GetItem(
                !string.IsNullOrEmpty(uploadMedia.DestinationFolderId)
                    ? uploadMedia.DestinationFolderId
                    : Constants.MediaLibraryPath, ItemScope.MediaOnly);

            if (destination == null)
            {
                throw new HorizonMediaException(MediaErrorCode.DestinationFolderNotFound);
            }

            if (!_itemPermissionChecker.CanWrite(destination, _scContext.User))
            {
                throw new HorizonMediaException(MediaErrorCode.InsufficientPrivileges);
            }

            MediaItem mediaItem;

            using var stream = new MemoryStream(uploadMedia.Blob);
            try
            {
                Item input = _mediaCreator.CreateItemFromStream(stream, $"{uploadMedia.FileName}.{uploadMedia.Extension}", mediaOptions);
                mediaItem = new MediaItem(input);
            }
            catch (Exception ex)
            {
                _logger.Error("Unable to create media from stream", ex, this);

                if (ex is SvgCannotBeUploadedException)
                {
                    throw new HorizonMediaException(MediaErrorCode.SvgScriptsNotAllowed, ex);
                }
                else
                {
                    throw new HorizonMediaException(MediaErrorCode.GenericError, ex);
                }
            }

            return mediaItem;
        }

        private static string GetValidFileName(string fileName) => ItemUtil.ProposeValidItemName(fileName);

        private MediaCreatorOptions GenerateMediaOptions(string mediaId, string destinationFolderId, string filename, Language language) => new MediaCreatorOptions
        {
            Database = _scContext.Database,
            Destination = $"{ResolverDestination(mediaId, destinationFolderId)}/{ResolverFileName(mediaId, destinationFolderId, filename)}",
            Versioned = _mediaSettings.UploadAsVersionableByDefault,
            Language = language,
            AlternateText = filename
        };

        [SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Justification = "Logs any exception and return media library root path")]
        private string? ResolverDestination(string mediaId, string destinationFolderId)
        {
            Assert.ArgumentNotNull(mediaId, nameof(mediaId));
            Assert.ArgumentNotNull(destinationFolderId, nameof(destinationFolderId));
            try
            {
                if (!string.IsNullOrEmpty(mediaId))
                {
                    return _horizonItemHelper.GetItem(mediaId, ItemScope.MediaOnly)?.Parent.Paths.FullPath;
                }

                if (!string.IsNullOrEmpty(destinationFolderId))
                {
                    return _horizonItemHelper.GetItem(destinationFolderId, ItemScope.MediaOnly)?.Paths.FullPath ?? Constants.MediaLibraryPath;
                }
            }
            catch (Exception ex)
            {
                _logger.Error($"{mediaId} is not accessible.", ex, this);
            }

            return Constants.MediaLibraryPath;
        }

        private string ResolverFileName(string mediaId, string destinationFolderId, string filename)
        {
            Assert.ArgumentNotNull(mediaId, nameof(mediaId));
            Assert.ArgumentNotNull(filename, nameof(filename));

            var newFilename = filename = GetValidFileName(filename);
            var increment = 0;
            var isItemNameExists = false;
            ChildList? children = null;

            if (!string.IsNullOrEmpty(mediaId))
            {
                children = _horizonItemHelper.GetItem(mediaId, ItemScope.MediaOnly)?.Parent.Children;
            }
            else if (!string.IsNullOrEmpty(destinationFolderId))
            {
                children = _horizonItemHelper.GetItem(destinationFolderId, ItemScope.MediaOnly)?.Children;
            }
            else
            {
                using (new SecurityDisabler())
                {
                    children = _horizonItemHelper.GetItem(ItemIDs.MediaLibraryRoot.ToString(), ItemScope.MediaOnly)?.Children;
                }
            }

            if (children is { Count: 0 })
            {
                return filename;
            }

            do
            {
                isItemNameExists = false;

                if (children == null)
                {
                    continue;
                }

                foreach (Item child in children)
                {
                    if (child.Name == newFilename)
                    {
                        isItemNameExists = true;
                        newFilename = $"{filename}{++increment}";
                    }
                }
            } while (isItemNameExists);

            return newFilename;
        }
    }
}
