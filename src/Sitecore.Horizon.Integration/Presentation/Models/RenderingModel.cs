// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;
using Sitecore.Horizon.Integration.Presentation.Models.Personalization;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Presentation.Models
{
    internal class RenderingModel
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("instanceId")]
        public Guid InstanceId { get; set; }

        [JsonProperty("placeholderKey")]
        public string PlaceholderKey { get; set; }

        [JsonProperty("dataSource", NullValueHandling = NullValueHandling.Ignore)]
        public string? DataSource { get; set; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter is required for desired functionality.")]
        [JsonProperty("parameters")]
        public Dictionary<string, string> Parameters { get; set; }

        [JsonProperty("caching", NullValueHandling = NullValueHandling.Ignore)]
        public CachingModel? Caching { get; set; }

        [JsonProperty("personalization", NullValueHandling = NullValueHandling.Ignore)]
        public PersonalizationModel? Personalization { get; set; }
    }
}
