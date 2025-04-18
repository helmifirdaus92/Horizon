// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;

namespace Sitecore.Horizon.Integration.Web
{
    internal interface IHorizonCspManager
    {
        void AddFrameAncestors(HttpContextBase context);
    }
}
