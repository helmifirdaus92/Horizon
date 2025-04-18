// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface ILifetimeSection
    {
        void SetValidFromDateTime(DateTime? from, string languageCode = "en", int version = 1);
        void SetValidToDateTime(DateTime? to, string languageCode = "en", int version = 1);
        void SetVersionPablishableState(bool isPablishable, string languageCode = "en", int version = 1);
        DateTime GetPublishingFromDateTime(int version = 1, string language = "en");
        DateTime GetPublishingToDateTime(int version = 1, string language = "en");
    }
}
