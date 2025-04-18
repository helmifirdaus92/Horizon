// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains
{
    internal class AddDomains : IPipelineProcessor<CollectIFrameAllowedDomainsArgs>
    {
        private readonly List<string> _allowedDomains = new();

        public void Process(CollectIFrameAllowedDomainsArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            foreach (string allowedDomain in _allowedDomains)
            {
                args.AllowedDomains.Add(allowedDomain);
            }
        }

        [UsedInConfiguration]
        public void AddDomain(string allowedDomain)
        {
            Assert.ArgumentNotNullOrEmpty(allowedDomain, nameof(allowedDomain));

            _allowedDomains.Add(allowedDomain);
        }
    }
}
