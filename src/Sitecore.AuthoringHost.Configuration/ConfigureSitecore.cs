// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Framework.Runtime.Configuration;

namespace Sitecore.AuthoringHost.Configuration
{
    [ExcludeFromCodeCoverage]
    public class ConfigureSitecore
    {
        private readonly ISitecoreConfiguration _scConfiguration;

        public ConfigureSitecore(ISitecoreConfiguration scConfiguration)
        {
            _scConfiguration = scConfiguration;
        }

        [SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "This method is a part of ASP.NET Core contract. It's invoked during the startup by host.")]
        public void ConfigureServices(IServiceCollection services)
        {
            string cmUrl = _scConfiguration.GetValue<string>("SitecorePlatform:ContentManagementUrl",string.Empty);
            string cmInternalUrl = _scConfiguration.GetValue<string>("SitecorePlatform:ContentManagementInternalUrl") ?? cmUrl;
            services.Configure<SitecorePlatformConfiguration>(config =>
            {
                config.ContentManagementUrl = new Uri(cmUrl, UriKind.RelativeOrAbsolute);
                config.ContentManagementInternalUrl = new Uri(cmInternalUrl, UriKind.RelativeOrAbsolute);
            });
        }
    }
}
