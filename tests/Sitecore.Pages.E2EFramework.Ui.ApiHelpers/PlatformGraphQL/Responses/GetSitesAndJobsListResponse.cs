// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class GetSitesAndJobsListResponse
{
    public Jobs jobs { get; set; }
    public List<SolutionSite> solutionSites { get; set; }

    public class Jobs
    {
        public List<Node> nodes { get; set; }
        public string __typename { get; set; }
    }

    public class Node
    {
        public string name { get; set; }
        public bool done { get; set; }
        public DateTime queueTime { get; set; }
        public string __typename { get; set; }
    }

    public class SolutionSite
    {
        public string id { get; set; }
        public string displayName { get; set; }
        public string name { get; set; }
        public string thumbnailUrl { get; set; }
        public string __typename { get; set; }
    }
}
