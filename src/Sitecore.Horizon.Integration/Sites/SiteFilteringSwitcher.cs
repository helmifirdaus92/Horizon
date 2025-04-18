// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Common;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.Sites
{
    internal class SiteFilteringSwitcher : Switcher<bool?, SiteFilteringSwitcher>
    {
        private readonly bool? _oldValue;

        private readonly SiteContext? _site;

        public SiteFilteringSwitcher(bool disableFiltering) : base(disableFiltering)
        {
            SiteContext site = Sitecore.Context.Site;
            if (site == null)
            {
                return;
            }

            _oldValue = site.DisableFiltering;
            _site = site;

            site.DisableFiltering = disableFiltering;

            Disposed += OnDisposed;
        }

        private void OnDisposed(object sender, EventArgs args)
        {
            if (_site != null && _oldValue != null)
            {
                _site.DisableFiltering = _oldValue.Value;
            }
        }
    }
}
