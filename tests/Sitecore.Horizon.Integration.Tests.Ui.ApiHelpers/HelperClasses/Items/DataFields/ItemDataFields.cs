// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.DataFields
{
    public class ItemDataFields
    {
        private readonly string _itemPath;
        private readonly DatabaseType _database;
        private readonly HelperService _helperService;

        public ItemDataFields(string itemPath, DatabaseType database, HelperService helperService)
        {
            _itemPath = itemPath;
            _database = database;
            _helperService = helperService;
        }


        public GeneralLinkField GetGeneralLinkField(string fieldName)
        {
            return new GeneralLinkField(fieldName, _itemPath, _database, _helperService);
        }
    }
}
