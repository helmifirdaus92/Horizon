// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data.Items;
using Sitecore.Globalization;

namespace Sitecore.Horizon.Integration.Media
{
    internal interface IMediaSearcher
    {
        MediaQueryResult GetAllMediaItems(IReadOnlyCollection<Item> sources, string[]? baseTemplateIds, Language language, int limit);

        MediaQueryResult SearchMediaItems(string searchQuery, IReadOnlyCollection<Item> sources, string[]? baseTemplateIds, Language language, int limit);
    }
}
