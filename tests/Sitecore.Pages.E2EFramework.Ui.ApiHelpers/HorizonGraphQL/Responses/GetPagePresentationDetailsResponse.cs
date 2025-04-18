// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class GetPagePresentationDetailsResponse
{
    public Page item { get; set; }
}

public class Page
{
    public string layoutEditingKind { get; set; }
    public string presentationDetails { get; set; }
}
