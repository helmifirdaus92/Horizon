// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class GetComponentsResponse
{
    public GetComponentsPayload components { get; set; }
}

public class GetComponentsPayload
{
    public List<ComponentGroup> groups { get; set; }
    public List<ComponentInfo> ungrouped { get; set; }
}

public class ComponentGroup
{
    public List<ComponentInfo> components { get; set; }
    public string title { get; set; }
}

public class ComponentInfo
{
    public string category { get; set; }
    public string categoryId { get; set; }
    public string componentName { get; set; }
    public string displayName { get; set; }
    public string iconUrl { get; set; }
    public string id { get; set; }
}
