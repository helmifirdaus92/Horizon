// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.Media
{
    internal interface IHorizonMediaManager
    {
        MediaItem GetMediaItem(string path, string[] sources);

        Item GetMediaFolderItem(string path);

        MediaQueryResult QueryMedia(string? query, string? root, string[] sources, string[]? baseTemplateIds);

        IEnumerable<Item> GetMediaFolderAncestors(string path, string[] sources);

        MediaItem CreateMedia(UploadMediaModel uploadMedia);
    }
}
