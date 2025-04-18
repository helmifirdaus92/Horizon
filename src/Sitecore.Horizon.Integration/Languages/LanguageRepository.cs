// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Abstractions;
using Sitecore.Collections;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Security.AccessControl;

namespace Sitecore.Horizon.Integration.Languages
{
    internal class LanguageRepository : ILanguageRepository
    {
        private readonly ISitecoreContext _context;
        private readonly BaseLanguageManager _baseLanguageManager;
        private readonly BaseAuthorizationManager _authorizationManager;
        private readonly BaseAccessRightManager _accessRightManager;
        private readonly BaseSettings _settings;

        public LanguageRepository(
            ISitecoreContext context,
            BaseLanguageManager baseLanguageManager,
            BaseAccessRightManager accessRightManager,
            BaseSettings settings,
            BaseAuthorizationManager authorizationManager
        )
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _baseLanguageManager = baseLanguageManager ?? throw new ArgumentNullException(nameof(baseLanguageManager));
            _accessRightManager = accessRightManager ?? throw new ArgumentNullException(nameof(accessRightManager));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _authorizationManager = authorizationManager ?? throw new ArgumentNullException(nameof(authorizationManager));
        }

        public LanguageCollection GetLanguages()
        {
            var allLanguages = _baseLanguageManager.GetLanguages(_context.Database);
            var validLanguages = new LanguageCollection();

            foreach (var language in allLanguages)
            {
                ID languageItemId = _baseLanguageManager.GetLanguageItemId(language, _context.Database);
                if (ID.IsNullOrEmpty(languageItemId))
                {
                    continue;
                }

                Item languageItem = _context.Database.GetItem(languageItemId);
                if (languageItem == null || languageItem.Appearance.Hidden || !HasLanguageReadPermission(languageItem))
                {
                    continue;
                }

                validLanguages.Add(language);
            }

            return validLanguages;

            bool HasLanguageReadPermission(Item languageItem)
            {
                return !_settings.Core().CheckSecurityOnLanguages ||
                    _authorizationManager.IsAllowed(languageItem, _accessRightManager.GetAccessRight(WellknownRights.LanguageRead), _context.User);
            }
        }
    }
}
