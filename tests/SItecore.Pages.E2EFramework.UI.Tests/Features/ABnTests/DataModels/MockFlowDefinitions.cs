// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels;
public class MockFlowDefinitions
{
    public MockFlowDefinitions()
    {
        SiteId = string.Empty;
        Name = string.Empty;
        FriendlyId = string.Empty;
        Type = "COMPONENT";
        Subtype = "EXPERIMENT";
        Channels = new List<string>
        {
            "WEB"
        };
        Tags = new List<string>();
        BusinessProcess = "interactive_v1";
        Traffic = new Traffic();
        Goals = new Goals();
        Variants = new List<Variant>();
        Status = "DRAFT";
        Schedule = new Schedule();
        SampleSizeConfig = new SampleSizeConfig();
    }

    [JsonProperty("siteId")]
    public string SiteId { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("friendlyId")]
    public string FriendlyId { get; set; }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("subtype")]
    public string Subtype { get; set; }

    [JsonProperty("channels")]
    public List<string> Channels { get; set; }

    [JsonProperty("tags")]
    public List<string> Tags { get; set; }

    [JsonProperty("businessProcess")]
    public string BusinessProcess { get; set; }

    [JsonProperty("traffic")]
    public Traffic Traffic { get; set; }

    [JsonProperty("goals")]
    public Goals Goals { get; set; }

    [JsonProperty("variants")]
    public List<Variant> Variants { get; set; }

    [JsonProperty("status")]
    public string Status { get; set; }

    [JsonProperty("schedule")]
    public Schedule Schedule { get; set; }

    [JsonProperty("sampleSizeConfig")]
    public SampleSizeConfig SampleSizeConfig { get; set; }
}

public class Traffic
{
    public Traffic()
    {
        Type = "simpleTraffic";
        Allocation = 100;
        Splits = new List<Split>();
        Coupled = false;
    }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("allocation")]
    public int Allocation { get; set; }

    [JsonProperty("splits")]
    public List<Split> Splits { get; set; }

    [JsonProperty("coupled")]
    public bool Coupled { get; set; }
}

public class Split
{
    [JsonProperty("ref")]
    public string Ref { get; set; }

    [JsonProperty("split")]
    public int SplitPercentage { get; set; }
}

public class Goals
{
    public Goals()
    {
        Primary = new PrimaryGoal();
    }

    [JsonProperty("primary")]
    public PrimaryGoal Primary { get; set; }
}

public class PrimaryGoal
{
    public PrimaryGoal()
    {
        Type = "pageViewGoal";
        Name = "page_view_goal";
        FriendlyId = "friendly_id_page_view_goal";
        GoalCalculation = new GoalCalculation();
        PageParameters = new List<object>();
    }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("friendlyId")]
    public string FriendlyId { get; set; }

    [JsonProperty("ref")]
    public string Ref { get; set; }

    [JsonProperty("description")]
    public string Description { get; set; }

    [JsonProperty("goalCalculation")]
    public GoalCalculation GoalCalculation { get; set; }

    [JsonProperty("pageParameters")]
    public List<object> PageParameters { get; set; }
}

public class GoalCalculation
{
    public GoalCalculation()
    {
        Type = "binary";
        Calculation = "INCREASE";
        Target = "conversionPerSession";
    }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("calculation")]
    public string Calculation { get; set; }

    [JsonProperty("target")]
    public string Target { get; set; }
}

public class Variant
{
    public Variant()
    {
        Name = "Default Variant";
        Ref = string.Empty;
        IsControl = false;
        Tasks = new List<Task>();
    }

    [JsonProperty("name")]
    public string Name { get; set; }

    [JsonProperty("ref")]
    public string Ref { get; set; }

    [JsonProperty("isControl")]
    public bool IsControl { get; set; }

    [JsonProperty("tasks")]
    public List<Task> Tasks { get; set; }
}

public class Task
{
    public Task()
    {
        Implementation = "templateRenderTask";
        Input = new TaskInput();
    }

    [JsonProperty("implementation")]
    public string Implementation { get; set; }

    [JsonProperty("input")]
    public TaskInput Input { get; set; }
}

public class TaskInput
{
    public TaskInput()
    {
        InputType = "templateRenderTaskInput";
        Type = "application/json";
        Template = string.Empty;
    }

    [JsonProperty("inputType")]
    public string InputType { get; set; }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("template")]
    public string Template { get; set; }
}

public class Schedule
{
    public Schedule()
    {
        Type = "simpleSchedule";
        StartDate = DateTime.UtcNow;
    }

    [JsonProperty("type")]
    public string Type { get; set; }

    [JsonProperty("startDate")]
    public DateTime StartDate { get; set; }
}

public class SampleSizeConfig
{
    public SampleSizeConfig()
    {
        BaseValue = 0.02;
        MinimumDetectableDifference = 0.2;
        ConfidenceLevel = 0.95;
    }

    [JsonProperty("baseValue")]
    public double BaseValue { get; set; }

    [JsonProperty("minimumDetectableDifference")]
    public double MinimumDetectableDifference { get; set; }

    [JsonProperty("confidenceLevel")]
    public double ConfidenceLevel { get; set; }
}
