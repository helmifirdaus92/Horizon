// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class CreateItemResponse
{
    public CreateItemPayload createPage { get; set; }
}

public class CreateItemPayload
{
    public Item item { get; set; }
    public bool success { get; set; }
}
