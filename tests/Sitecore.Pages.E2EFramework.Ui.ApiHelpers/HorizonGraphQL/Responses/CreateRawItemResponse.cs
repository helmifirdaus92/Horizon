// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class CreateRawItemResponse
{
    public CreateRawItemPayload createRawItem { get; set; }
}

public class CreateRawItemPayload
{
    public RawContentItem rawItem { get; set; }
    public bool success { get; set; }
}
