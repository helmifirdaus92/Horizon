// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

//TODO: Temporary models for layout deserialization. To be replaced with LayoutService models after getting OSS approval. 
namespace Sitecore.Horizon.Core.Model.Rendering
{
    public class LayoutResponse
    {
        [JsonProperty("sitecore")]
        public SitecoreData? Sitecore { get; set; }
    }

    public class SitecoreData
    {
        [JsonProperty("context")]
        public Context? Context { get; set; }

        [JsonProperty("route")]
        public Route? Route { get; set; }
    }

    public class Context
    {
        [JsonProperty("site")]
        public LayoutSite? Site { get; set; }

        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        [JsonProperty("clientScripts")]
        public string[] ClientScripts { get; set; } = Array.Empty<string>();
    }

    public class Route
    {
        [JsonProperty("deviceId")]
        public string? DeviceId { get; set; }

        [JsonProperty("itemId")]
        public string? ItemId { get; set; }

        [JsonProperty("itemVersion")]
        public int? ItemVersion { get; set; }

        [JsonProperty("itemLanguage")]
        public string? ItemLanguage { get; set; }
    }

    public class LayoutSite
    {
        [JsonProperty("name")]
        public string? Name { get; set; }
    }
}
