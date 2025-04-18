// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Responses;

public class GetVariantsResponse
{
    public Item item { get; set; }

    public class Item
    {
        public string id { get; set; }
        public ItemPersonalization personalization { get; set; }
    }

    public class ItemPersonalization
    {
        public List<string> variantIds { get; set; }
    }
}
