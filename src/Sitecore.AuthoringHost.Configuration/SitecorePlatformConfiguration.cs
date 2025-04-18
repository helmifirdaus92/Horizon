// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

#nullable disable warnings // It's mapped by config engine

namespace Sitecore.AuthoringHost.Configuration
{
    public class SitecorePlatformConfiguration
    {
        public Uri ContentManagementUrl { get; set; }
        public Uri ContentManagementInternalUrl { get; set; }
    }
}
