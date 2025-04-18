// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Sitecore.Data;

namespace Sitecore.Horizon.Integration.Canvas
{
    internal class CanvasState
    {
        [JsonProperty("itemId")] public ID? ItemId { get; set; }

        [JsonProperty("itemVersion")] public int? ItemVersion { get; set; }

        [JsonProperty("siteName")] public string? SiteName { get; set; }

        [JsonProperty("language")] public string? Language { get; set; }

        [JsonProperty("deviceId")] public ID? DeviceId { get; set; }

        [JsonProperty("pageMode")] public string? PageMode { get; set; }

        [JsonProperty("variant")] public string? Variant { get; set; }
    }
}
