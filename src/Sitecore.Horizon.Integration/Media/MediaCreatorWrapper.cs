// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.IO;
using Sitecore.Data.Items;
using Sitecore.Resources.Media;

namespace Sitecore.Horizon.Integration.Media
{
    internal interface IMediaCreatorWrapper
    {
        Item CreateItemFromStream(MemoryStream stream, string fileName, MediaCreatorOptions options);
    }

    internal class MediaCreatorWrapper : IMediaCreatorWrapper
    {
        public Item CreateItemFromStream(MemoryStream stream, string fileName, MediaCreatorOptions options)
        {
            return MediaManager.Creator.CreateFromStream(stream, fileName, options);
        }
    }
}
