// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Sitecore.Horizon.Core.Model.Rendering
{
    public class CanvasMessage<T>
    {
        public CanvasMessage(CanvasMessageType type, T data)
        {
            Type = type;
            Data = data;
        }


        [SuppressMessage("Microsoft.Naming", "CA1721:PropertyNamesShouldNotMatchGetMethods", Justification = "Naming is correct here.")]
        [JsonProperty("type")]
        [JsonConverter(typeof(StringEnumConverter))]
        public CanvasMessageType Type { get; }

        [JsonProperty("data")] public T? Data { get; }
    }

    public class CanvasState
    {
        [JsonProperty("itemId")] public string? ItemId { get; set; }

        [JsonProperty("itemVersion")] public int? ItemVersion { get; set; }

        [JsonProperty("siteName")] public string? SiteName { get; set; }

        [JsonProperty("language")] public string? Language { get; set; }

        [JsonProperty("deviceId")] public string? DeviceId { get; set; }

        [JsonProperty("pageMode")] public string? PageMode { get; set; }

        [JsonProperty("variant")] public string? Variant { get; set; }
    }

    public enum CanvasMessageType
    {
        State = 0,
    }
}
