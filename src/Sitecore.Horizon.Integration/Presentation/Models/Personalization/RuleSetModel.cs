// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Presentation.Models.Personalization
{
    internal class RuleSetModel
    {
        /// <summary>
        /// Personalization tracking
        /// </summary>
        [JsonProperty("pet", NullValueHandling = NullValueHandling.Ignore)]
        public bool? Pet { get; init; }

        [JsonProperty("rules")]
        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        public List<RuleModel> Rules { get; init; }

        [SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly", Justification = "Setter is required for desired functionality.")]
        [JsonProperty("parameters", NullValueHandling = NullValueHandling.Ignore)]
        public Dictionary<string, string>? Parameters { get; init; }
    }
}
