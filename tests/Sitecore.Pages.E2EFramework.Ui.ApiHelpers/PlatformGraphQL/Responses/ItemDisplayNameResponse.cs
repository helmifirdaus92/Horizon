// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class ItemDisplayNameResponse
{
    public UpdateItem updateItem { get; set; }

    public class UpdateItem
    {
        public Item item { get; set; }
    }

    public class Item
    {
        public string displayName { get; set; }
    }
}
