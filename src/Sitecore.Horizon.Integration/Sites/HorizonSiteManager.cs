// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.IO;
using Sitecore.Sites;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Sites
{
    internal class HorizonSiteManager : IHorizonSiteManager
    {
        private readonly BaseSiteContextFactory _siteContextFactory;
        private readonly ISitecoreContext _context;

        public HorizonSiteManager(BaseSiteContextFactory siteContextFactory, ISitecoreContext context)
        {
            _siteContextFactory = siteContextFactory;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }


        public SiteContext? GetSiteByName(string name)
        {
            return _siteContextFactory.GetSiteContext(name);
        }

        public IEnumerable<SiteContext> GetAllSites(bool includeSystemSites)
        {
            var siteContexts = GetAllSiteInfos(includeSystemSites);

            return siteContexts.Select(x => new SiteContext(x));
        }

        public string? TryBestMatchClientSiteByHost(string host)
        {
            Assert.ArgumentNotNullOrEmpty(host, nameof(host));

            SiteInfo? matchingSite = GetAllSiteInfos(includeSystemSites: false).FirstOrDefault(x => !string.IsNullOrEmpty(x.HostName) && x.Matches(host));
            return matchingSite?.Name;
        }

        private IEnumerable<SiteInfo> GetAllSiteInfos(bool includeSystemSites)
        {
            IEnumerable<SiteInfo> allSites = _siteContextFactory.GetSites();

            if (!includeSystemSites)
            {
                allSites = allSites.Where(site => !site.IsInternal);
            }

            allSites = allSites.Where(site => _context.Database.GetItem(FileUtil.MakePath(site.RootPath, site.StartItem)) != null);

            return allSites;
        }
    }
}
