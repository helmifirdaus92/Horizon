// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;

#nullable disable warnings // It's mapped by config engine

namespace Sitecore.Horizon.Core.Model.Rendering
{
    public class RenderResult
    {
        /// <summary>
        /// The rendered html from the invoked JavaScript module
        /// </summary>
        [JsonProperty("html")]
        public string Html { get; set; }

        /// <summary>
        /// The response status code.
        /// </summary>
        [JsonProperty("status")]
        public int? Status { get; set; }
    }
}
