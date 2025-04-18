// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;

public class GetPartialDesignsRootResponse
{
    public List<PartialDesignsRoot> partialDesignsRoots { get; set; }

    public class PartialDesignsRoot
    {
        public Root root { get; set; }
        public string siteName { get; set; }
    }

    public class Root
    {
        public Children children { get; set; }
    }

    public class Children
    {
        public List<Item> nodes { get; set; }
    }
}
