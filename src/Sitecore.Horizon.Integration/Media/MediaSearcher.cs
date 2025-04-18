// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Sitecore.Abstractions;
using Sitecore.ContentSearch.Linq;
using Sitecore.ContentSearch.Linq.Utilities;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Search;

namespace Sitecore.Horizon.Integration.Media
{
    internal class MediaSearcher : IMediaSearcher
    {
        private readonly IMediaTemplateDiscoverer _mediaTemplateDiscoverer;
        private readonly IPlatformSearchRunner _platformSearchRunner;
        private readonly BaseMediaManager _mediaManager;

        public MediaSearcher(IMediaTemplateDiscoverer mediaTemplateDiscoverer, IPlatformSearchRunner platformSearchRunner, BaseMediaManager mediaManager)
        {
            Assert.ArgumentNotNull(mediaTemplateDiscoverer, nameof(mediaTemplateDiscoverer));
            Assert.ArgumentNotNull(platformSearchRunner, nameof(platformSearchRunner));
            Assert.ArgumentNotNull(mediaManager, nameof(mediaManager));

            _mediaTemplateDiscoverer = mediaTemplateDiscoverer;
            _platformSearchRunner = platformSearchRunner;
            _mediaManager = mediaManager;
        }

        public MediaQueryResult GetAllMediaItems(IReadOnlyCollection<Item> sources, string[]? baseTemplateIds, Language language, int limit)
        {
            Assert.ArgumentNotNull(sources, nameof(sources));
            Assert.ArgumentCondition(sources.Count > 0, nameof(sources), "At least one source should be provided");
            Assert.ArgumentNotNull(language, nameof(language));

            var source = sources.First();
            var db = source.Database;

            using (var searchContext = _platformSearchRunner.CreateSearchContext(source))
            {
                IQueryable<HorizonMediaSearchModel> queryable = searchContext
                    .GetQueryable<HorizonMediaSearchModel>()
                    .Where(x => x.IsLatestVersion)
                    .Where(BuildPathFilter(sources))
                    .Where(BuildTemplateFilter(baseTemplateIds, db, language))
                    .OrderByDescending(x => x.Updated);

                return CollectItemsTillLimit(queryable, db, language, limit);
            }
        }

        public MediaQueryResult SearchMediaItems(string searchQuery, IReadOnlyCollection<Item> sources, string[]? baseTemplateIds, Language language, int limit)
        {
            Assert.ArgumentNotNullOrEmpty(searchQuery, nameof(searchQuery));
            Assert.ArgumentNotNull(sources, nameof(sources));
            Assert.ArgumentCondition(sources.Count > 0, nameof(sources), "At least one source should be provided");
            Assert.ArgumentNotNull(language, nameof(language));

            var source = sources.First();
            var db = source.Database;

            string transformedSearchQuery = TransformSearchQuery(searchQuery);

            using (var searchContext = _platformSearchRunner.CreateSearchContext(source))
            {
                IQueryable<HorizonMediaSearchModel> queryable = searchContext
                    .GetQueryable<HorizonMediaSearchModel>()
                    .Where(x => x.Name.MatchWildcard(transformedSearchQuery)
                        || x.DisplayName.MatchWildcard(transformedSearchQuery)
                        || x.Alt.MatchWildcard(transformedSearchQuery)
                        || x.Content.MatchWildcard(transformedSearchQuery))
                    .Filter(x => x.IsLatestVersion)
                    .Filter(BuildPathFilter(sources))
                    .Filter(BuildTemplateFilter(baseTemplateIds, db, language));

                return CollectItemsTillLimit(queryable, db, language, limit);
            }
        }

        /// <summary>
        /// Apply same transformation as the platform media library search does.
        /// It makes the query more fuzzy, letting it to discover more items.
        /// </summary>
        private static string TransformSearchQuery(string text)
        {
            string query = text.Trim();
            query = RemoveMultiSpace(query);

            return QuoteWildCard(query);


            string RemoveMultiSpace(string txt)
            {
                while (txt.IndexOf("  ", StringComparison.Ordinal) >= 0)
                {
                    txt = txt.Replace("  ", " ");
                }

                return txt;
            }

            bool IsQuoted(string txt)
            {
                return txt.StartsWith("\"", StringComparison.Ordinal) && txt.EndsWith("\"", StringComparison.Ordinal);
            }

            string QuoteWildCard(string txt)
            {
                // If the term contains a hyphen and is not already quoted, quote it
                // Hyphen is an operator in Solr, but we want to treat it as a literal string
                if (txt.Contains("-") && !IsQuoted(txt))
                {
                    txt = $"\"{txt}\"";
                }

                if (!IsQuoted(txt))
                {
                    return txt.Replace(" ", "* ") + "*";
                }

                return txt;
            }
        }

        private static Expression<Func<HorizonMediaSearchModel, bool>> BuildPathFilter(IReadOnlyCollection<Item> sources)
        {
            Expression<Func<HorizonMediaSearchModel, bool>> pathCondition = PredicateBuilder.False<HorizonMediaSearchModel>();

            foreach (Item source in sources)
            {
                pathCondition = pathCondition.Or(x => x.Paths.Contains(source.ID));
            }

            return pathCondition;
        }

        private MediaQueryResult CollectItemsTillLimit(IQueryable<HorizonMediaSearchModel> queryableWithAppliedFilters, Database db, Language language, int resultSetMaxSize)
        {
            var accumulatedResults = new List<MediaItem>(resultSetMaxSize);
            var alreadyHandledItems = new HashSet<ID>();

            int alreadyProcessedDocsCount = 0;
            bool hasMoreItems;

            // It might happen that not all the items returned in the first batch are suitable for us
            // (e.g. some items don't have media stream attached, or duplicated language versions are returned for the unversioned media).
            // Therefore, we collect items in a loop till we collect the necessary amount of items or reach the end of the index.
            do
            {
                int queryBatchSize = resultSetMaxSize - accumulatedResults.Count;
                SearchResults<HorizonMediaSearchModel> result = _platformSearchRunner.Execute(queryableWithAppliedFilters.Skip(alreadyProcessedDocsCount).Take(queryBatchSize));

                int itemsInCurrentBatch = 0;
                foreach (SearchHit<HorizonMediaSearchModel> hit in result.Hits)
                {
                    itemsInCurrentBatch++;

                    HorizonMediaSearchModel document = hit.Document;

                    var uri = document.Uri;
                    var mediaItem = db.GetItem(uri.ItemID, /* Get item in current language */ language);
                    if (mediaItem == null)
                    {
                        continue;
                    }

                    bool hasStream = _mediaManager.HasMediaContent(mediaItem);
                    if (!hasStream)
                    {
                        continue;
                    }

                    // An unversioned media item might be returned more than once due to having different language versions.
                    // In that case consume information from the first version. It will work fine, as unversioned media mostly consists of shared fields, which are not version specific.
                    if (!alreadyHandledItems.Add(mediaItem.ID))
                    {
                        continue;
                    }

                    accumulatedResults.Add(mediaItem);
                }

                // Notice, the platform might filter out items and it decreases the `TotalSearchResults` by the amount of subtracted items.
                hasMoreItems = alreadyProcessedDocsCount + itemsInCurrentBatch < result.TotalSearchResults;
                alreadyProcessedDocsCount += queryBatchSize;
            } while (hasMoreItems && accumulatedResults.Count < resultSetMaxSize);

            return new MediaQueryResult(accumulatedResults, hasMoreItems);
        }

        private Expression<Func<HorizonMediaSearchModel, bool>> BuildTemplateFilter(string[]? baseTemplateIds, Database db, Language language)
        {
            if (baseTemplateIds != null)
            {
                return BuildCustomTemplateFilter(baseTemplateIds, db, language);                
            }
            else
            {
                return BuildDefaultTemplateFilter(db, language);
            }
        }

        private Expression<Func<HorizonMediaSearchModel, bool>> BuildCustomTemplateFilter(string[] baseTemplateIds, Database db, Language language)
        {
            Expression<Func<HorizonMediaSearchModel, bool>> templateCondition = PredicateBuilder.False<HorizonMediaSearchModel>();

            foreach (ID templateId in _mediaTemplateDiscoverer.WithDescendantTemplates(baseTemplateIds, db))
            {
                templateCondition = templateCondition.Or(x => x.TemplateId == templateId && x.Language == language.Name);
            }

            return templateCondition;
        }

        private Expression<Func<HorizonMediaSearchModel, bool>> BuildDefaultTemplateFilter(Database db, Language language)
        {
            Expression<Func<HorizonMediaSearchModel, bool>> templateCondition = PredicateBuilder.False<HorizonMediaSearchModel>();

            foreach (ID templateId in _mediaTemplateDiscoverer.GetVersionedMediaTemplates(db))
            {
                templateCondition = templateCondition.Or(x => x.TemplateId == templateId && x.Language == language.Name);
            }

            foreach (ID templateId in _mediaTemplateDiscoverer.GetUnversionedMediaTemplates(db))
            {
                templateCondition = templateCondition.Or(x => x.TemplateId == templateId);
            }

            return templateCondition;
        }
    }
}
