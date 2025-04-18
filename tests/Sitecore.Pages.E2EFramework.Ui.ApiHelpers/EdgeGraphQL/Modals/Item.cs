// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Modals
{
    public class Item
    {
        public string id { get; set; }
        public string name { get; set; }
        public string displayName { get; set; }
        public List<Field> fields { get; set; }
        public Personalization personalization { get; set; }

        public class Personalization
        {
            public List<string> variantIds;
        }
    }
}
