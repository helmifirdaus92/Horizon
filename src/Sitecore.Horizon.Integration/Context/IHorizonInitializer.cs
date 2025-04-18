// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;

namespace Sitecore.Horizon.Integration.Context
{
    internal interface IHorizonInitializer
    {
        void InitializeHorizonHeadless(HttpContextBase? httpContext);
    }
}
