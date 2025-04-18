// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Newtonsoft.Json;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.Presentation.Models
{
    internal class PlaceholderModel
    {
        [JsonProperty("key")]
        public string Key { get; set; }

        [JsonProperty("instanceId")]
        public Guid InstanceId { get; set; }

        [JsonProperty("metadataId")]
        public Guid MetadataId { get; set; }
    }
}
