// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class InsertOptionsSection : IInsertOptionsSection
    {
        private readonly string _contextItemPath;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;

        public InsertOptionsSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemPath = contextItemPath;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public void AssignInsertOptions(params string[] templateIds)
        {
            _helperService.EditItem(_contextItemPath, "__Masters", string.Join("|", templateIds), (Database)_contextDatabase);
        }

        public ICollection<string> GetInsertOptions()
        {
            return _helperService.GetItemFieldValue(_contextItemPath, "__Masters", (Database)_contextDatabase).Split('|');
        }
    }
}
