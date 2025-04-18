// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    class AppearanceSection : IAppearanceSection
    {
        private readonly string _contextItemId;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;

        public AppearanceSection(string itemId, DatabaseType databaseType, HelperService helper)
        {
            _contextItemId = itemId;
            _contextDatabase = databaseType;
            _helperService = helper;
        }

        public void SetDisplayName(string displayName, string language = "en", int version = 1)
        {
            _helperService.EditItemVersion(_contextItemId, language, version, "__Display name", displayName, (Database)_contextDatabase);
        }

        public string GetDisplayName(string language = "en", int version = 1)
        {
            return _helperService.GetFieldVersionValue(_contextItemId, "__Display name", language, version, (Database)_contextDatabase);
        }
    }
}
