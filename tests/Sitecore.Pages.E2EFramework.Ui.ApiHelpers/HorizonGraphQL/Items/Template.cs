// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

public class Template
{
    public string displayName { get; set; }
    public TemplateField field { get; set; }
    public string id { get; set; }
    public bool isTemplateDescendantOfAny { get; set; }
    public string name { get; set; }
    public string path { get; set; }
}

public class TemplateField
{
    public string id { get; set; }
    public List<string> sources { get; set; }
}
