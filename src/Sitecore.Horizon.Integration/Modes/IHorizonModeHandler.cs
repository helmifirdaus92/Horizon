// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Modes
{
    internal interface IHorizonModeHandler
    {
        bool CanHandle(HeadlessMode mode);

        HeadlessModeParameters HandleHeadlessMode(HeadlessModeParameters parameters, HttpContextBase httpContext);
    }
}
