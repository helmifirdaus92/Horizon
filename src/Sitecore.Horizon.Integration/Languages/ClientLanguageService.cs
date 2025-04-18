// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Context;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.Languages
{
    internal class ClientLanguageService : IClientLanguageService
    {
        private readonly IHorizonSiteManager _horizonSiteManager;
        private readonly ISitecoreContextHelper _sitecoreContextHelper;
        private readonly BaseSettings _settings;
        private readonly BaseLanguageManager _languageManager;

        public ClientLanguageService(IHorizonSiteManager horizonSiteManager, ISitecoreContextHelper sitecoreContextHelper, BaseSettings settings, BaseLanguageManager languageManager)
        {
            _horizonSiteManager = horizonSiteManager;
            _sitecoreContextHelper = sitecoreContextHelper;
            _settings = settings;
            _languageManager = languageManager;
        }

        public string GetClientLanguage()
        {
            return StringUtil.GetString(_sitecoreContextHelper.Context.User.Profile.ClientLanguage, _settings.Core().ClientLanguage);
        }

        public void SetClientLanguage(string clientLanguage)
        {
            clientLanguage = StringUtil.GetString(clientLanguage, _settings.Core().ClientLanguage);

            if (string.IsNullOrEmpty(clientLanguage))
            {
                return;
            }

            SiteContext? shellSite = _horizonSiteManager.GetSiteByName(Constants.ShellSiteName);
            if (shellSite == null)
            {
                return;
            }

            Language languageObj = _languageManager.GetLanguage(clientLanguage);
            _sitecoreContextHelper.Context.SetLanguage(languageObj, persistent: true, site: shellSite);
        }

        public void ApplyClientLanguage()
        {
            string clientLanguage = GetClientLanguage();
            SetClientLanguage(clientLanguage);
        }
    }
}
