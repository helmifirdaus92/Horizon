// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;

#nullable disable warnings

namespace Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders
{
    internal class HostVerificationModel
    {
        [JsonProperty("hostVerificationToken")]
        public string HostVerificationToken { get; set; }
    }
}
