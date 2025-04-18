// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class MoveItemResponse
{
    public MoveItemPayload moveItem { get; set; }
}

public class MoveItemPayload
{
    public bool success { get; set; }
}
