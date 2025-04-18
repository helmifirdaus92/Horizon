// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Media.Models;

namespace Sitecore.Horizon.Integration.Media
{
    internal interface IMediaUploader
    {
        MediaItem CreateMedia(UploadMediaModel uploadMedia);
    }
}
