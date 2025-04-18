// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace Sitecore.Horizon.Integration.Canvas
{
    internal class CanvasMessage<T>
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
}
