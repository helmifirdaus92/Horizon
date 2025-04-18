// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Abstractions;
using Sitecore.DependencyInjection;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.LaunchPad;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.LaunchPad
{
    internal class HorizonHostResolver : ILaunchPadPathResolver
    {
        private readonly BaseLog _logger;
        private readonly BaseSettings _settings;
        private readonly ISitecoreContextHelper _sitecoreContextHelper;
        private readonly IHorizonSiteManager _siteManager;

        public HorizonHostResolver() : this(
            ServiceLocator.ServiceProvider.GetService<BaseLog>()!,
            ServiceLocator.ServiceProvider.GetService<BaseSettings>()!,
            ServiceLocator.ServiceProvider.GetService<ISitecoreContextHelper>()!,
            ServiceLocator.ServiceProvider.GetService<IHorizonSiteManager>()!
        )
        {
        }

        public HorizonHostResolver(
            BaseLog logger,
            BaseSettings settings,
            ISitecoreContextHelper sitecoreContextHelper,
            IHorizonSiteManager siteManager)
        {
            _logger = logger;
            _settings = settings;
            _sitecoreContextHelper = sitecoreContextHelper;
            _siteManager = siteManager;
        }

        public virtual string Execute()
        {
            string clientHost = _settings.Horizon().ClientHost;
            string startPage = _settings.Horizon().ClientHostStartPage;
            string tenantName = _settings.Horizon().PlatformTenantName;
            string horizonUrl;
            List<string> parameters = new List<string>();

            try
            {
                Uri clientHostUri = new Uri(clientHost);
                Uri horizonUri = new Uri(clientHostUri, startPage);
                horizonUrl = horizonUri.ToString();
            }
#pragma warning disable CA1031 // Do not catch general exception types
            catch (Exception ex)
#pragma warning restore CA1031 // Do not catch general exception types
            {
                _logger.Error("Error in 'Horizon.ClientHost' settings, 'Pages' link in LanchPad may not work properly.", ex, this);
                horizonUrl = $"{clientHost}{startPage}";
            }

            if (!string.IsNullOrEmpty(tenantName))
            {
                parameters.AddRange(new[] { "tenantName" , tenantName });
            }

            string? host = _sitecoreContextHelper.Context.HttpContext?.Request.Url?.Host;
            string? hostMatchedSite = host != null ? _siteManager.TryBestMatchClientSiteByHost(host) : null;
            if (hostMatchedSite != null)
            {
                parameters.AddRange(new[] { "sc_site", hostMatchedSite });
            }

            return WebUtil.AddQueryString(horizonUrl, parameters.ToArray());
        }
    }
}
