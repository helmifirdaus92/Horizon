// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;

namespace Sitecore.Horizon.Integration.GraphQL.Configuration
{
    internal static class HorizonGqlSettingsExtensions
    {
        public static HorizonGqlSettings HorizonGql(this BaseSettings settings) => new(settings);

        public struct HorizonGqlSettings
        {
            private readonly BaseSettings _settings;

            public HorizonGqlSettings(BaseSettings settings)
            {
                _settings = settings;
            }

            public bool ShowDetailedErrors => _settings.GetBoolSetting("Horizon.GraphQL.ShowDetailedErrors", false);
        }
    }

}
