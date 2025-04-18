// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class VersionSection : IVersionSection
    {
        private readonly string _contextItemPath;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;
        private readonly string _fieldName = "__Version Name";

        public VersionSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemPath = contextItemPath;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public string GetVersionName(string language, int versionNumber)
        {
            return _helperService.GetFieldVersionValue(_contextItemPath, _fieldName, language, versionNumber, (Database)_contextDatabase);
        }

        public void SetVersionName(string value, string language, int versionNumber)
        {
            _helperService.EditItemVersion(_contextItemPath, language, versionNumber, _fieldName, value, (Database)_contextDatabase);
        }
    }
}
