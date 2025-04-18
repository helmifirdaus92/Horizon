// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;

namespace Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains
{
    internal class AddDomainsList : IPipelineProcessor<CollectIFrameAllowedDomainsArgs>
    {
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public string AllowedDomains { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.

        public void Process(CollectIFrameAllowedDomainsArgs args)
        {
            Assert.ArgumentNotNull(args, nameof(args));

            if (!string.IsNullOrWhiteSpace(AllowedDomains))
            {
                foreach (string allowedDomain in
                    AllowedDomains.Split(new char[] { ';' }, System.StringSplitOptions.RemoveEmptyEntries))
                {
                    if (!string.IsNullOrWhiteSpace(allowedDomain) && !args.AllowedDomains.Contains(allowedDomain))
                    {
                        args.AllowedDomains.Add(allowedDomain);
                    }
                }
            }
        }
    }
}
