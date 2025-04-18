// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Configuration;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Web;

namespace Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode
{
    internal class EnsureHorizonHostIsAllowed : IHorizonPipelineProcessor<ResolveHorizonModeArgs>
    {
        private readonly BaseSettings _settings;
        private readonly ICollection<string> _allowedDomains;

        public EnsureHorizonHostIsAllowed(BaseSettings settings, BaseCorePipelineManager pipelineManager)
        {
            _settings = settings;
            var args = new CollectIFrameAllowedDomainsArgs();
            pipelineManager.Horizon().CollectIFrameAllowedDomains(args);
            _allowedDomains = args.AllowedDomains;
        }

        public void Process(ref ResolveHorizonModeArgs args)
        {
            Assert.ArgumentNotNull(args.HorizonRequestState, nameof(args.HorizonRequestState));
            var horizonHost = args.HorizonRequestState!.HorizonHost;

            if (string.IsNullOrEmpty(horizonHost) || !MatchAllowedDomains(_allowedDomains, horizonHost!))
            {
                var fallbackClientHost = _settings.Horizon().ClientHost;
                args.HorizonRequestState = new HorizonRequestState(args.HorizonRequestState.Mode, fallbackClientHost);
            }
        }

        private static bool MatchAllowedDomains(IEnumerable<string> allowedDomains, string horizonHost)
        {
            if (!Uri.TryCreate(horizonHost, UriKind.Absolute, out var hostUri))
            {
                return false;
            }

            foreach (string allowedDomain in allowedDomains)
            {
                if (MatchAllowedDomain(allowedDomain, hostUri))
                {
                    return true;
                }
            }

            return false;
        }

        private static bool MatchAllowedDomain(string allowedDomain, Uri hostUri)
        {
            // match by URI authority when allowed domain provided as absolute URI
            if (Uri.TryCreate(allowedDomain, UriKind.Absolute, out var allowedDomainUri))
            {
                return Uri.Compare(hostUri, allowedDomainUri, UriComponents.SchemeAndServer, UriFormat.Unescaped, StringComparison.Ordinal) == 0;
            }

            // match only by host when allowed domain provided only as a hostname and can't be parsed as URI
            return string.Equals(hostUri.Host, allowedDomain, StringComparison.Ordinal);
        }
    }
}
