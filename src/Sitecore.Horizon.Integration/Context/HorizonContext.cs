// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Web;
using Sitecore.Security.Accounts;
using Sitecore.Sites.Headless;

namespace Sitecore.Horizon.Integration.Context
{
#pragma warning disable CS0618 // Type or member is obsolete
    internal class HorizonContext : IHorizonInternalContext, IHorizonContext
#pragma warning restore CS0618 // Type or member is obsolete
    {
        public const string ContextModeKey = "SC_Horizon_Mode";

        private readonly ISitecoreContext _sitecoreContext;
        private readonly IHorizonRequestHelper _requestHelper;
        private readonly BaseSiteManager _siteManager;
        private readonly BaseTicketManager _ticketManager;

        public HorizonContext(
            ISitecoreContext sitecoreContext,
            IHorizonRequestHelper requestHelper,
            BaseSiteManager siteManager,
            BaseTicketManager ticketManager)
        {
            Assert.ArgumentNotNull(sitecoreContext, nameof(sitecoreContext));
            Assert.ArgumentNotNull(requestHelper, nameof(requestHelper));
            Assert.ArgumentNotNull(siteManager, nameof(siteManager));
            Assert.ArgumentNotNull(ticketManager, nameof(ticketManager));

            _sitecoreContext = sitecoreContext;
            _requestHelper = requestHelper;
            _siteManager = siteManager;
            _ticketManager = ticketManager;
        }

        [Obsolete("Use HeadlessMode instead directly from kernel")]
        HorizonContextMode IHorizonContext.HorizonMode =>
            GetMode() switch
            {
                HorizonMode.Editor => HorizonContextMode.Editor,
                HorizonMode.Preview => HorizonContextMode.Preview,
                HorizonMode.Api => HorizonContextMode.Api,
                _ => HorizonContextMode.None
            };

        public HeadlessMode GetHeadlessMode()
        {
            return _sitecoreContext.HeadlessContext.GetMode();
        }

        [Obsolete("Use GetHeadlessMode instead")]
        public HorizonMode GetMode()
        {
            if (_sitecoreContext.GetData(ContextModeKey) is HorizonModeParameters cachedValue)
            {
                return cachedValue.Mode;
            }

            return HorizonMode.Disabled;
        }

        public void SetHeadlessMode(HeadlessModeParametersWithHorizonHost parameters)
        {
            Assert.ArgumentNotNull(parameters, nameof(parameters));
            HeadlessModeParameters headlessModeParameters = parameters.Parameters;
            _sitecoreContext.HeadlessContext.SetMode(headlessModeParameters);

            // for backward compatibility also set legacy mode
#pragma warning disable CS0618
            var legacyHorizonMode = new HorizonModeParameters
            {
                Mode = GetHorizonLegacyMode(headlessModeParameters.Mode),
                Duration = headlessModeParameters.Duration == HeadlessModeDuration.CurrentRequest ? HorizonModeDuration.CurrentRequest : HorizonModeDuration.Persistent,
                AllowBeacon = headlessModeParameters.Mode is HeadlessMode.Edit,
                ResetDisplayMode = headlessModeParameters.ResetDisplayMode,
                HorizonHost = parameters.HorizonHost
            };

            SetHorizonMode(legacyHorizonMode);
#pragma warning restore CS0618
        }

        public bool HasHorizonAccess(User contextUser)
        {
            Assert.ArgumentNotNull(contextUser, nameof(contextUser));

            return _ticketManager.IsCurrentTicketValid() && _siteManager.CanEnter(Constants.ShellSiteName, contextUser);
        }

        public string GetHorizonHost()
        {
            if (_sitecoreContext.GetData(ContextModeKey) is HorizonModeParameters cachedValue)
            {
                return cachedValue.HorizonHost ?? string.Empty;
            }

            return string.Empty;
        }

#pragma warning disable CS0618
        private static HorizonMode GetHorizonLegacyMode(HeadlessMode mode)
        {
            return mode switch
            {
                HeadlessMode.Api => HorizonMode.Api,
                HeadlessMode.Edit => HorizonMode.Editor,
                HeadlessMode.Preview => HorizonMode.Preview,
                _ => HorizonMode.Disabled
            };
        }

        private void SetHorizonMode(HorizonModeParameters parameters)
        {
            Assert.ArgumentNotNull(parameters, nameof(parameters));

            _sitecoreContext.SetData(ContextModeKey, parameters);

            if (parameters.Duration == HorizonModeDuration.Persistent)
            {
                var cookie = new HorizonRequestState(parameters.Mode, parameters.HorizonHost);
                SetHorizonModeCookie(cookie);
            }
        }

        private void SetHorizonModeCookie(HorizonRequestState value)
        {
            HttpContextBase? httpContext = _sitecoreContext.HttpContext;
            if (httpContext != null)
            {
                _requestHelper.SetHorizonModeCookie(httpContext, value);
            }
        }
    }
#pragma warning restore CS0618
}
