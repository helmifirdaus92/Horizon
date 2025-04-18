// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using System.Web;
using System.Web.Mvc;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Extensions;
using Sitecore.Sites;
using Sitecore.Text;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Web
{
    internal class HorizonRequestHelper : IHorizonRequestHelper
    {
        public const string HorizonModeKey = "sc_horizon";
        public const string HorizonHostKey = "sc_horizonhost";

        private readonly BaseSiteContextFactory _siteContextFactory;

        public HorizonRequestHelper(BaseSiteContextFactory siteContextFactory)
        {
            Assert.ArgumentNotNull(siteContextFactory, nameof(siteContextFactory));

            _siteContextFactory = siteContextFactory;
        }

        public HorizonRequestState GetHorizonRequestStateFromQueryStringOrCookie(HttpContextBase context)
        {
            Assert.ArgumentNotNull(context, nameof(context));

            string? modeValue = WebUtil.GetQueryString(HorizonModeKey, null, context) ?? GetLatestCookieValue(HorizonModeKey, context);

            string? hostHostValue = WebUtil.GetQueryString(HorizonHostKey, null, context) ?? GetLatestCookieValue(HorizonHostKey, context);

            return HorizonRequestState.Parse(modeValue!, hostHostValue);
        }

        public void SetHorizonModeCookie(HttpContextBase context, HorizonRequestState value)
        {
            Assert.ArgumentNotNull(context, nameof(context));
            Assert.ArgumentNotNull(value, nameof(value));

#pragma warning disable CS0618
            if (value.Mode != HorizonMode.Disabled)
#pragma warning restore CS0618
            {
                string valueStr = value.RawMode();
                SetCookie(context, HorizonModeKey, valueStr);
            }
            else
            {
                ClearCookie(context, HorizonModeKey);
            }

            if (!string.IsNullOrEmpty(value.HorizonHost))
            {
                SetCookie(context, HorizonHostKey, value.HorizonHost);
            }
            else
            {
                ClearCookie(context, HorizonHostKey);
            }
        }

        public void RedirectToLoginPageIfApplicable(HttpContextBase context)
        {
            Assert.ArgumentNotNull(context, nameof(context));

            if (context.Request.IsAjaxRequest())
            {
                return;
            }

            var url = new UrlString
            {
                Path = GetShellLoginPage()
            };

            url["returnUrl"] = url["returnUrl"] ?? context.Request.RawUrl;

            context.Response.Redirect(url.ToString());
        }

        private static string? GetLatestCookieValue(string cookieName, HttpContextBase context)
        {
            // Support override in same request.
            HttpCookie? responseCookie = context.Response.Cookies.GetSafely(cookieName);
            if (responseCookie != null)
            {
                return responseCookie.Value;
            }

            HttpCookie? requestCookie = context.Request.Cookies.GetSafely(cookieName);
            return requestCookie?.Value;
        }

        private static void SetCookie(HttpContextBase context, string cookieName, string? cookieValue)
        {
            var currentValue = GetLatestCookieValue(cookieName, context);
            if (cookieValue == currentValue)
            {
                return;
            }

            var cookie = new HttpCookie(cookieName, cookieValue)
            {
                HttpOnly = false,
                SameSite = SameSiteMode.None,
                Secure = true
            };

            context.Response.Cookies.Set(cookie);
        }

        private static void ClearCookie(HttpContextBase context, string cookieName)
        {
            var currentValue = GetLatestCookieValue(cookieName, context);
            if (string.IsNullOrEmpty(currentValue))
            {
                return;
            }

            HttpCookie cookie = new HttpCookie(cookieName)
            {
                Expires = DateTime.UtcNow.AddDays(-1),
                SameSite = SameSiteMode.None,
                Secure = true
            };

            context.Response.Cookies.Set(cookie);
        }

        [SuppressMessage("Microsoft.Globalization", "CA1303:Do not pass literals as localized parameters", Justification = "Resource is unnecessary for logs.")]
        private string GetShellLoginPage()
        {
            SiteContext site = Assert.ResultNotNull(_siteContextFactory.GetSiteContext(Constants.ShellSiteName));

            Assert.IsNotNullOrEmpty(site.LoginPage, "No login page specified for current site: " + site.Name);

            return site.LoginPage;
        }
    }
}
