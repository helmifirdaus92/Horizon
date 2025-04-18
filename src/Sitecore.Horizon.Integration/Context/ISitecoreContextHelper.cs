// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.Context
{
    internal interface ISitecoreContextHelper
    {
        ISitecoreContext Context { get; }

        bool TryEnableDisplayMode(SiteContext site, DisplayMode displayMode);

        void ResetDisplayModeForRequest(SiteContext site);

        void EnablePreviewForUnpublishableItems(SiteContext site);
    }
}
