// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Web;

namespace Sitecore.Horizon.Integration.Web
{
    internal interface IHorizonRequestHelper
    {
        HorizonRequestState GetHorizonRequestStateFromQueryStringOrCookie(HttpContextBase context);

        void SetHorizonModeCookie(HttpContextBase context, HorizonRequestState value);

        void RedirectToLoginPageIfApplicable(HttpContextBase context);
    }
}
