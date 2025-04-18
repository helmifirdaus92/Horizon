// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Presentation.Models
{
    internal class DeviceModel
    {
        [JsonProperty("id")]
        public Guid Id { get; set; }

        [JsonProperty("layoutId")]
        public Guid LayoutId { get; set; }

        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        [JsonProperty("placeholders")]
        public PlaceholderModel[] Placeholders { get; set; }

        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        [JsonProperty("renderings")]
        public RenderingModel[] Renderings { get; set; }
    }
}
