// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.Sites
{
    internal interface IHorizonSiteManager
    {
        string? TryBestMatchClientSiteByHost(string host);

        IEnumerable<SiteContext> GetAllSites(bool includeSystemSites);

        SiteContext? GetSiteByName(string name);
    }
}
