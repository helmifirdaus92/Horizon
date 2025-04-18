// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Configuration;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal class SitecoreLegacySettings : ISitecoreLegacySettings
    {
        public bool PublishingEnabled => Settings.Publishing.Enabled;
    }
}
