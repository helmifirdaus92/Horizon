// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable enable
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types
{
    public class Site
    {
        public string? name { get; set; }
        public Language? language { get; set; }
        public string? appName { get; set; }
        public string? layoutServiceConfig { get; set; }
        public string? renderingEngineEndpointUrl { get; set; }
        public string? renderingEngineApplicationUrl { get; set; }
        public List<PointOfSale>? pointOfSale { get; set; }
        public Item? rootItem { get; set; }
        public Item? startItem { get; set; }
        public bool? enableWebEdit { get; set; }
        public bool? isSxaSite { get; set; }
    }

    public class PointOfSale
    {
        public string? name { get; set; }
        public string? language { get; set; }
    }

    public class Language
    {
        public string? name { get; set; }
    }
}
