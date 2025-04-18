// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Newtonsoft.Json;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Boxever.Models;

public class FlowDefinition
{
    public string clientKey { get; set; }
    public string href { get; set; }
    public string @ref { get; set; }
    public string name { get; set; }
    public string modifiedByRef { get; set; }
    public string modifiedAt { get; set; }
    public int revision { get; set; }
    public bool archived { get; set; }
    public string friendlyId { get; set; }
    public string type { get; set; }
    public string subtype { get; set; }
    public List<string> channels { get; set; }
    public List<object> triggers { get; set; }
    public List<object> tags { get; set; }
    public string businessProcess { get; set; }
    public string siteId { get; set; }
    public Traffic traffic { get; set; }
    public List<object> variants { get; set; }
    public List<object> transpiledVariants { get; set; }
    public string status { get; set; }
    public Schedule schedule { get; set; }
    public Revisions revisions { get; set; }
    public SampleSizeConfig sampleSizeConfig { get; set; }
    public bool notificationEnabled { get; set; }

    public class Revisions
    {
        public string href { get; set; }
    }

    public class Condition
    {
        public string templateId { get; set; }
        public Params @params { get; set; }
        public string templateFriendlyId { get; set; }
        public int templateRevision { get; set; }
        public string conditionFriendlyId { get; set; }
    }

    public class ConditionGroup
    {
        public List<Condition> conditions { get; set; }
    }

    public class Params
    {
        public string @is { get; set; }
        public string country { get; set; }

        [JsonProperty("region(s)")]
        public string regions { get; set; }
    }

    public class SampleSizeConfig
    {
        public double baseValue { get; set; }
        public double minimumDetectableDifference { get; set; }
        public double confidenceLevel { get; set; }
    }

    public class Schedule
    {
        public string type { get; set; }
        public string startDate { get; set; }
    }

    public class Split
    {
        public string variantName { get; set; }
        public string audienceName { get; set; }
        public List<ConditionGroup> conditionGroups { get; set; }
        public string template { get; set; }
    }

    public class Traffic
    {
        public string type { get; set; }
        public string weightingAlgorithm { get; set; }
        public List<Split> splits { get; set; }
    }
}
