// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class LifetimeSection : ILifetimeSection
    {
        private readonly string _contextItemId;
        private readonly DatabaseType _contextDatabase;
        private readonly HelperService _helperService;

        public LifetimeSection(string contextItemId, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemId = contextItemId;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public void SetValidFromDateTime(DateTime? from, string languageCode = "en", int version = 1)
        {
            var formattedDateTime = DateTimeHelper.GetFormattedDateTime(from);
            _helperService.EditItemVersion(_contextItemId, languageCode, version, "__Valid from", formattedDateTime, (Database)_contextDatabase);
        }

        public void SetValidToDateTime(DateTime? to, string languageCode = "en", int version = 1)
        {
            var formattedDateTime = DateTimeHelper.GetFormattedDateTime(to);
            _helperService.EditItemVersion(_contextItemId, languageCode, version, "__Valid to", formattedDateTime, (Database)_contextDatabase);
        }

        public void SetVersionPablishableState(bool isPablishable, string languageCode = "en", int version = 1)
        {
            string hideVersion = isPablishable ? "" : "1";
            _helperService.EditItemVersion(_contextItemId, languageCode, version, "__Hide version", hideVersion, (Database)_contextDatabase);
        }

        public DateTime GetPublishingFromDateTime(int version = 1, string language = "en")
        {
            string date = _helperService.GetFieldVersionValue(_contextItemId, "__Valid from", language, version, (Database)_contextDatabase);
            return DateTimeHelper.ParseDateTimeString(date, DateTime.MinValue);
        }

        public DateTime GetPublishingToDateTime(int version = 1, string language = "en")
        {
            string date = _helperService.GetFieldVersionValue(_contextItemId, "__Valid to", language, version, (Database)_contextDatabase);
            return DateTimeHelper.ParseDateTimeString(date, DateTime.MaxValue);
        }
    }
}
