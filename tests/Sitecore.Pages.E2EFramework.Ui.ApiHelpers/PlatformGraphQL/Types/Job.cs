// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

public class Job
{
    public string displayName { get; set; }
    public bool done { get; set; }
    public string handle { get; set; }
    public string name { get; set; }
    public JobOptions options { get; set; }
    public DateTime queueTime { get; set; }
    public JobStatus status { get; set; }
}

public class JobOptions
{
    public bool abortable { get; set; }
    public string category { get; set; }
    public string jobName { get; set; }
    public string siteName { get; set; }
}

public class JobStatus
{
    public List<string> exceptions { get; set; }
    public DateTime expiry { get; set; }
    public string jobState { get; set; }
    public List<string> messages { get; set; }
    public long processed { get; set; }
    public long total { get; set; }
}
