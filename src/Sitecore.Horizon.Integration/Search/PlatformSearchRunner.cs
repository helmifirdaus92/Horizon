// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using Sitecore.ContentSearch;
using Sitecore.ContentSearch.Linq;
using Sitecore.ContentSearch.Security;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Search
{
    internal class PlatformSearchRunner : IPlatformSearchRunner
    {
        public IProviderSearchContext CreateSearchContext(Item source)
        {
            Assert.ArgumentNotNull(source, nameof(source));

            return ContentSearchManager.GetIndex(new SitecoreIndexableItem(source)).CreateSearchContext(SearchSecurityOptions.EnableSecurityCheck);
        }

        public SearchResults<T> Execute<T>(IQueryable<T> query)
        {
            Assert.ArgumentNotNull(query, nameof(query));

            return query.GetResults();
        }
    }
}
