// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Presentation.Models.Personalization
{
    internal class RuleActionModel
    {
        [JsonProperty("uniqueId")]
        public string UniqueId { get; set; }

        [JsonProperty("id")]
        public string Id { get; set; }

        [JsonProperty("dataSource", NullValueHandling = NullValueHandling.Ignore)]
        public string? DataSource { get; set; }

        [JsonProperty("renderingParameters", NullValueHandling = NullValueHandling.Ignore)]
        public Dictionary<string, string>? RenderingParameters { get; set; }


        [JsonProperty("renderingItem", NullValueHandling = NullValueHandling.Ignore)]
        public string? RenderingItem { get; set; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter is required for desired functionality.")]
        [JsonProperty("parameters", NullValueHandling = NullValueHandling.Ignore)]
        public Dictionary<string, string>? Parameters { get; set; }
    }
}
