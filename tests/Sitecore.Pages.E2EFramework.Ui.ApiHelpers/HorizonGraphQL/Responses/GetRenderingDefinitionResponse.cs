// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class GetRenderingDefinitionResponse
{
    public RenderingDefinitionPayload renderingDefinition { get; set; }
}

public class RenderingDefinitionPayload
{
    public List<Item> datasourceRootItems { get; set; }
    public List<Template> templates { get; set; }
}
