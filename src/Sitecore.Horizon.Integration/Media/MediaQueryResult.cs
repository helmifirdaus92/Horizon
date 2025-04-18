// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Media
{
    internal class MediaQueryResult
    {
        public MediaQueryResult(IEnumerable<MediaItem> items, bool hasMoreItems)
        {
            Items = items;
            HasMoreItems = hasMoreItems;
        }

        public IEnumerable<MediaItem> Items { get; }

        public bool HasMoreItems { get; }
    }
}
