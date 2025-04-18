// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

#nullable disable warnings // It's a model

namespace Sitecore.Horizon.Integration.Presentation.Models
{
    internal class PresentationDetails
    {
        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        [JsonProperty("devices")]
        public DeviceModel[] Devices { get; set; }
    }
}
