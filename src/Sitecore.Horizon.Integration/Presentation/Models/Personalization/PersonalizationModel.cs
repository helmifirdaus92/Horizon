// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Diagnostics.CodeAnalysis;
using Newtonsoft.Json;

namespace Sitecore.Horizon.Integration.Presentation.Models.Personalization
{
    internal class PersonalizationModel
    {
        public PersonalizationModel(RuleSetModel? ruleSet, string? conditions, string? multiVariateTestId, string? personalizationTest)
        {
            RuleSet = ruleSet;
            Conditions = conditions;
            MultiVariateTestId = multiVariateTestId;
            PersonalizationTest = personalizationTest;
        }

        [SuppressMessage("Microsoft.Performance", "CA1819:PropertiesShouldNotReturnArrays", Justification = "Not a readonly property")]
        [JsonProperty("ruleSet", NullValueHandling = NullValueHandling.Ignore)]
        public RuleSetModel? RuleSet { get; set; }

        [JsonProperty("conditions", NullValueHandling = NullValueHandling.Ignore)]
        public string? Conditions { get; set; }

        [JsonProperty("multiVariateTestId", NullValueHandling = NullValueHandling.Ignore)]
        public string? MultiVariateTestId { get; set; }

        [JsonProperty("personalizationTest", NullValueHandling = NullValueHandling.Ignore)]
        public string? PersonalizationTest { get; set; }
    }
}
