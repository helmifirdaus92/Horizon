// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Media.Models;
using Sitecore.IO;

namespace Sitecore.Horizon.Integration.Media
{
    internal class HorizonMediaManager : IHorizonMediaManager
    {
        private readonly IHorizonItemHelper _itemHelper;
        private readonly IMediaSearcher _mediaSearcher;
        private readonly IHorizonItemTreeBuilder _treeBuilder;
        private readonly ISitecoreContext _scContext;
        private readonly IMediaUploader _mediaUploader;

        public HorizonMediaManager(IHorizonItemHelper itemHelper,
            IMediaSearcher mediaSearcher,
            IHorizonItemTreeBuilder treeBuilder,
            ISitecoreContext scContext,
            IMediaUploader mediaUploader)
        {
            _itemHelper = itemHelper;
            _mediaSearcher = mediaSearcher;
            _treeBuilder = treeBuilder;
            _scContext = scContext;
            _mediaUploader = mediaUploader;
        }

        public MediaItem GetMediaItem(string path, string[] sources)
        {
            var item = ResolveMediaItem(path);

            if (!IsValidItemSource(item, sources))
            {
                throw new HorizonMediaException(MediaErrorCode.SourceNotFound);
            }

            return item;
        }

        public Item GetMediaFolderItem(string path)
        {
            Item? item = _itemHelper.GetItem(path, ItemScope.MediaOnly);
            if (item == null)
            {
                throw new HorizonMediaException(MediaErrorCode.NotFound);
            }

            if (!_itemHelper.IsMediaFolder(item) && !_itemHelper.IsFolder(item))
            {
                throw new HorizonMediaException(MediaErrorCode.NotAFolder);
            }

            return item;
        }

        public MediaQueryResult QueryMedia(string? query, string? root, string[] sources, string[]? baseTemplateIds)
        {
            const int limit = 500;

            (Item[]? sourceItems, MediaErrorCode sourceError) = ResolveSources(sources);
            if (sourceError != MediaErrorCode.None)
            {
                throw new HorizonMediaException(sourceError);
            }

            (Item[]? queryScopeSources, MediaErrorCode rootItemError) = ResolveRootItems(root, sourceItems!);
            if (rootItemError != MediaErrorCode.None)
            {
                throw new HorizonMediaException(rootItemError);
            }

            MediaQueryResult result;
            if (string.IsNullOrEmpty(query))
            {
                result = _mediaSearcher.GetAllMediaItems(queryScopeSources!, baseTemplateIds, _scContext.Language, limit);
            }
            else
            {
                result = _mediaSearcher.SearchMediaItems(query!, queryScopeSources!, baseTemplateIds, _scContext.Language, limit);
            }

            return result;
        }

        public IEnumerable<Item> GetMediaFolderAncestors(string path, string[] sources)
        {
            var folderItem = GetMediaFolderItem(path);

            (Item[]? sourceItems, MediaErrorCode sourceError) = ResolveSources(sources);
            if (sourceError != MediaErrorCode.None)
            {
                throw new HorizonMediaException(sourceError);
            }

            var result = _treeBuilder.TryBuildMediaFolderAncestorsTree(folderItem, sourceItems!);
            if (result == null)
            {
                throw new HorizonMediaException(MediaErrorCode.SourceNotReachable);
            }

            return result;
        }

        public MediaItem CreateMedia(UploadMediaModel uploadMedia)
        {
            return _mediaUploader.CreateMedia(uploadMedia);
        }

        private MediaItem ResolveMediaItem(string path)
        {
            Item? item = _itemHelper.GetItem(path, ItemScope.AnyNonSystem);

            // Support paths relative to media library
            if (item == null && !path.StartsWith(Constants.MediaLibraryPath, StringComparison.OrdinalIgnoreCase))
            {
                var expandedPath = FileUtil.MakePath(Constants.MediaLibraryPath, path);
                item = _itemHelper.GetItem(expandedPath, ItemScope.AnyNonSystem);
            }

            if (item == null)
            {
                throw new HorizonMediaException(MediaErrorCode.NotFound);
            }

            if (!_itemHelper.IsMediaItem(item))
            {
                throw new HorizonMediaException(MediaErrorCode.NotAMedia);
            }

            return new MediaItem(item);
        }

        private bool IsValidItemSource(Item item, string[] sources)
        {
            (Item[]? sourceItems, MediaErrorCode sourceError) = ResolveSources(sources);
            return sourceError == MediaErrorCode.None && sourceItems!.Any(s => item.Paths.IsDescendantOf(s));
        }

        private (Item[]? item, MediaErrorCode error) ResolveSources(string[] sources)
        {
            if (sources.Length == 0)
            {
                var mediaLibraryItem = _itemHelper.GetItem(ItemIDs.MediaLibraryRoot, ItemScope.MediaOnly) ?? throw new InvalidOperationException("Media library root is not accessible");
                return (new[]
                {
                    mediaLibraryItem
                }, default);
            }

            Item[] sourceItems = sources.Select(s => _itemHelper.GetItem(s, ItemScope.MediaOnly)).Where(x => x != null).ToArray()!;
            if (sourceItems.Length == sources.Length)
            {
                return (sourceItems, default);
            }

            return (default, MediaErrorCode.SourceNotFound);
        }

        private (Item[]? item, MediaErrorCode error) ResolveRootItems(string? path, Item[] sourceItems)
        {
            if (string.IsNullOrEmpty(path))
            {
                return (sourceItems, default);
            }

            Item? item = _itemHelper.GetItem(path!, ItemScope.MediaOnly);
            if (item != null && sourceItems.Any(source => item.ID == source.ID || item.Paths.IsDescendantOf(source)))
            {
                return (new[]
                {
                    item
                }, default);
            }

            return (default, MediaErrorCode.RootNotFound);
        }
    }
}
