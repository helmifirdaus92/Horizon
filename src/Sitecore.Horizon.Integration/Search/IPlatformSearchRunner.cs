// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using Sitecore.ContentSearch;
using Sitecore.ContentSearch.Linq;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Search
{
    /// <summary>
    /// Proxy to the static ContentSearch API to make unit testing easier.
    /// </summary>
    internal interface IPlatformSearchRunner
    {
        IProviderSearchContext CreateSearchContext(Item source);

        SearchResults<T> Execute<T>(IQueryable<T> query);
    }
}
