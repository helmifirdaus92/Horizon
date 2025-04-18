// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IStatisticsSection
    {
        void SetCreatedDateTime(DateTime created, string languageCode = "en", int version = 1);
        DateTime GetCreatedDateTime(int version = 1, string language = "en");
        string GetCreatedBy(int version = 1, string language = "en");
    }
}
