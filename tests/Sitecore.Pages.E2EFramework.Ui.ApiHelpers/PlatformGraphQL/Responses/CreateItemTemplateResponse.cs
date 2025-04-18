// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class CreateItemTemplateResponse
{
    public CreateItemTemplate createItemTemplate { get; set; }

    public class CreateItemTemplate
    {
        public Template itemTemplate { get; set; }
    }
}
