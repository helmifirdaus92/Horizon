// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class SearchResponse
{
    public Dictionary<string, decimal> facetMetrics { get; set; }
    public List<SearchResultFacetCategory> facets { get; set; }
    public List<SearchResultItem> results { get; set; }
    public int totalCount { get; set; }

    public class SearchResultFacetCategory
    {
        public List<SearchResultFacet> facets { get; set; }
        public string name { get; set; }
    }

    public class SearchResultFacet
    {
        public int count { get; set; }
        public string name { get; set; }
    }

    public class SearchResultItem
    {
        public string createdBy { get; set; }
        public DateTime createdDate { get; set; }
        public string database { get; set; }
        public string dataSource { get; set; }
        public string displayName { get; set; }
        public Item innerItem { get; set; }
        public string itemId { get; set; }
        public string language { get; set; }
        public string name { get; set; }
        public string parentId { get; set; }
        public string templateId { get; set; }
        public string templateName { get; set; }
        public string updatedBy { get; set; }
        public DateTime updatedDate { get; set; }
        public string uri { get; set; }
        public int version { get; set; }
    }
}
