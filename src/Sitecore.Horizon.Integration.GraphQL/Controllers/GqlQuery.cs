// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

#pragma warning disable CA2227 // We do not want make fields set-only, as they are bound by MVC

namespace Sitecore.Horizon.Integration.GraphQL.Controllers
{
    public class GqlQuery
    {
        [JsonProperty(PropertyName = "operationName")]
        public string? OperationName { get; set; }

        [JsonProperty(PropertyName = "variables")]
        public JObject? Variables { get; set; }

        [JsonProperty(PropertyName = "query")]
        public string? Query { get; set; }
    }
}
