// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Security.AccessControl;
using Sitecore.Security.Accounts;

namespace Sitecore.Horizon.Integration.Items
{
    internal class ItemPermissionChecker : IItemPermissionChecker
    {
        public const string ClientPublishingRole = @"sitecore\Sitecore Client Publishing";

        private readonly ISitecoreLegacySettings _legacySettings;
        private readonly BaseLanguageManager _languageManager;
        private readonly BaseAuthorizationManager _authorizationManager;
        private readonly BaseSettings _settings;

        public ItemPermissionChecker(ISitecoreLegacySettings legacySettings,
            BaseLanguageManager languageManager,
            BaseAuthorizationManager authorizationManager,
            BaseSettings settings)
        {
            _legacySettings = legacySettings ?? throw new ArgumentNullException(nameof(legacySettings));
            _languageManager = languageManager ?? throw new ArgumentNullException(nameof(languageManager));
            _authorizationManager = authorizationManager ?? throw new ArgumentNullException(nameof(authorizationManager));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
        }

        public bool CanWrite(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            return item.Security.CanWrite(user);
        }

        public bool CanDelete(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            return item.Security.CanDelete(user);
        }

        public bool CanRename(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            return item.Security.CanRename(user);
        }

        public bool CanCreate(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            return item.Security.CanCreate(user);
        }

        public bool CanPublish(Item item, User user)
        {
            Assert.ArgumentNotNull(user, nameof(user));

            return _legacySettings.PublishingEnabled && (user.IsAdministrator || user.IsInRole(ClientPublishingRole));
        }

        public bool CanUnlock(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            // Sitecore API has the following method: item.Locking.CanUnlock() This method also check 'CanAdmin' access right.
            // But our(and SC) save pipeline checks only 'user.IsAdministrator' in case of locking.

            return HasLock(item, user) || user.IsAdministrator;
        }

        public bool CanWriteItemLanguage(Item item, User user)
        {
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(user, nameof(user));

            if (!_settings.Core().CheckSecurityOnLanguages || user.IsAdministrator)
            {
                return true;
            }

            var languageItem = _languageManager.GetLanguageItem(item.Language, item.Database);

            return languageItem != null && _authorizationManager.IsAllowed(languageItem, AccessRight.LanguageWrite, user);
        }

        private static bool HasLock(Item item, User user)
        {
            LockField lockField = item.Fields[FieldIDs.Lock];

            if (lockField == null)
            {
                return false;
            }

            return lockField.Owner.Equals(user.Name, StringComparison.OrdinalIgnoreCase);
        }
    }
}
