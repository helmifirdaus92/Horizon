// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Configuration;

namespace Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains
{
    internal class AddHorizonClientHost : IPipelineProcessor<CollectIFrameAllowedDomainsArgs>
    {
        private readonly BaseSettings _settings;

        public AddHorizonClientHost(BaseSettings settings)
        {
            Assert.ArgumentNotNull(settings, nameof(settings));

            _settings = settings;
        }

        public void Process(CollectIFrameAllowedDomainsArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            string horizonClientHost = _settings.Horizon().ClientHost;

            if (!string.IsNullOrEmpty(horizonClientHost))
            {
                args.AllowedDomains.Add(horizonClientHost);
            }
        }
    }
}
