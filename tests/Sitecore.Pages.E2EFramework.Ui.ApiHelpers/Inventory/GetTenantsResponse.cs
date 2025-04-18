// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Newtonsoft.Json;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Inventory;

public class GetTenantsResponse
{
    public int totalCount { get; set; }
    public int pageSize { get; set; }
    public int pageNumber { get; set; }
    public List<TenantData> data { get; set; }

    public class Annotations
    {
        public string URL { get; set; }

        [JsonProperty("XMCloud.ProjectName")]
        public string XMCloudProjectName { get; set; }

        [JsonProperty("XMCloud.EnvironmentName")]
        public string XMCloudEnvironmentName { get; set; }

        [JsonProperty("XMCloud.CustomerEnvironmentType")]
        public string XMCloudCustomerEnvironmentType { get; set; }

        [JsonProperty("XMCloud.ProjectId")]
        public string XMCloudProjectId { get; set; }

        [JsonProperty("XMCloud.EnvironmentId")]
        public string XMCloudEnvironmentId { get; set; }
    }

    public class TenantData
    {
        public string id { get; set; }
        public string systemId { get; set; }
        public string name { get; set; }
        public string displayName { get; set; }
        public string organizationId { get; set; }
        public Annotations annotations { get; set; }
        public Labels labels { get; set; }
        public string state { get; set; }
    }

    public class Labels
    {
        public string CustomerEnvironmentType { get; set; }
        public string Environment { get; set; }
        public string ProductCode { get; set; }
        public string Region { get; set; }
    }
}
