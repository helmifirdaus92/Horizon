// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class StatisticsSection : IStatisticsSection
    {
        private readonly string _contextItemId;
        private readonly Database _contextDatabase;
        private readonly HelperService _helperService;

        public StatisticsSection(string contextItemId, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemId = contextItemId;
            _contextDatabase = (Database)contextDatabase;
            _helperService = helperService;
        }

        public void SetCreatedDateTime(DateTime created, string languageCode = "en", int version = 1)
        {
            _helperService.EditItemVersion(_contextItemId, languageCode, version, "__Created", DateTimeHelper.GetFormattedDateTime(created), _contextDatabase);
        }

        public DateTime GetCreatedDateTime(int version = 1, string language = "en")
        {
            string date = _helperService.GetFieldVersionValue(_contextItemId, "__Created", language, version, _contextDatabase);
            return DateTimeHelper.ParseDateTimeString(date);
        }

        public string GetCreatedBy(int version = 1, string language = "en")
        {
            return _helperService.GetFieldVersionValue(_contextItemId, "__Created by", language, version, _contextDatabase);
        }
    }
}
