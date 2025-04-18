// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.SxaRestClient.Responses;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class DevicesPayload
{
    public Devices[] devices { get; set; }
}

public class Devices
{
    public string id { get; set; }
    public string layoutId { get; set; }
    public string[] placeholders { get; set; }
    public Rendering[] renderings { get; set; }
}

public class Rendering
{
    public string id { get; set; }
    public string instanceId { get; set; }
    public string placeholderKey { get; set; }
    public string dataSource { get; set; }
    public RenderingParameters parameters { get; set; }
}
