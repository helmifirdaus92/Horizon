// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;

namespace Sitecore.Horizon.Integration.Presentation.Models
{
    internal class CachingModel
    {
        [JsonProperty("cacheable", NullValueHandling = NullValueHandling.Ignore)]
        public bool? Cacheable { get; set; }

        [JsonProperty("varyByData", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByData { get; set; }

        [JsonProperty("varyByDevice", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByDevice { get; set; }

        [JsonProperty("varyByLogin", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByLogin { get; set; }

        [JsonProperty("varyByParameters", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByParameters { get; set; }

        [JsonProperty("varyByQueryString", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByQueryString { get; set; }

        [JsonProperty("varyByUser", NullValueHandling = NullValueHandling.Ignore)]
        public bool? VaryByUser { get; set; }

        [JsonProperty("clearOnIndexUpdate", NullValueHandling = NullValueHandling.Ignore)]
        public bool? ClearOnIndexUpdate { get; set; }
    }
}
