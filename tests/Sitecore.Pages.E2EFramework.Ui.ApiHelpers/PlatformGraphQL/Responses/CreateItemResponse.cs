// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses
{
    public class CreateItemResponse
    {
        public CreateItemPayload createItem { get; set; }
    }

    public class CreateItemPayload
    {
        public Item item { get; set; }
    }
}
