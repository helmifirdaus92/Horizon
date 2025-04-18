// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Sitecore.Data;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Pipelines.GetChromeData
{
    internal class HorizonChromeDataItem
    {
        public HorizonChromeDataItem(Item item)
        {
            Id = item.ID;
            Version = item.Version.Number;
            Language = item.Language.Name;
            Revision = item[FieldIDs.Revision].Replace("-", string.Empty);
        }

        [JsonProperty("id")]
        public ID Id { get; set; }

        [JsonProperty("version")]
        public int Version { get; set; }

        [JsonProperty("language")]
        public string Language { get; set; }

        [JsonProperty("revision")]
        public string Revision { get; set; }
    }
}
