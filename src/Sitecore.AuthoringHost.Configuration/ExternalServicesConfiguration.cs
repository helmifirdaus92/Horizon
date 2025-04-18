// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings // It's mapped by config engine

using System;

namespace Sitecore.AuthoringHost.Configuration
{
    public class ExternalServicesConfiguration
    {
        public Uri InventoryApiBaseUrl { get; set; }

        public string XMCloudSystemId { get; set; }

        public Uri? DashboardBaseUrl { get; set; }

        public Uri? PortalBaseUrl { get; set; }

#pragma warning disable CA1056 // Uri properties should not be strings
        public string FormsApiBaseUrl { get; set; }

        public Uri? EdgePlatformBaseUrl { get; set; }

        public Uri? FeatureFlagsBaseUrl { get; set; }

        public Uri XMDeployAppApiBaseUrl { get; set; }

        public Uri XMDeployAppBaseUrl { get; set; }

        public Uri ExplorerAppBaseUrl { get; set; }

        public Uri? ApmServerBaseUrl { get; set; }

        public Uri? XMAppsApiBaseUrl { get; set; }

        public string BrandManagementBaseUrl { get; set; }

        public string Environment { get; set; }

        public string GainsightProductKey { get; set; }

        public string AnalyticsBaseUrl { get; set; }

        public string AnalyticsRegionsMapper { get; set; }

#pragma warning restore CA1056 // Uri properties should not be strings
    }
}
