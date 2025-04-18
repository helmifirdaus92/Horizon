// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types;

public class Job
{
    public string name { get; set; }
    public bool done { get; set; }
    public DateTime queueTime { get; set; }
    public string handle { get; set; }
    public string site { get; set; }
    public string siteCollection { get; set; }
}
