// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class PublishingSection : IPublishingSection
    {
        private string _contextItemId;
        private DatabaseType _contextDatabase;
        private HelperService _helperService;

        public PublishingSection(string contextItemId, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemId = contextItemId;
            _contextDatabase = contextDatabase;
            _helperService = helperService;
        }

        public void SetPublishingFromDateTime(DateTime from)
        {
            var formattedDate = GetFormattedDateString(from);
            _helperService.EditItem(_contextItemId, "__Publish", formattedDate, (Database)_contextDatabase);
        }

        public void SetPublishingToDateTime(DateTime to)
        {
            var formattedDate = GetFormattedDateString(to);
            _helperService.EditItem(_contextItemId, "__Unpublish", formattedDate, (Database)_contextDatabase);
        }

        public void SetItemPublishableState(bool isPablishable)
        {
            string neverPublish = isPablishable ? "" : "1";
            _helperService.EditItem(_contextItemId, "__Never publish", neverPublish, (Database)_contextDatabase);
        }

        private string GetFormattedDateString(DateTime dateTime)
        {
            return dateTime.Year + dateTime.Month.ToString("D2") + dateTime.Day.ToString("D2") +
                $"T{dateTime.Hour.ToString("D2") + dateTime.Minute.ToString("D2") + dateTime.Second.ToString("D2")}Z";
        }
    }
}
