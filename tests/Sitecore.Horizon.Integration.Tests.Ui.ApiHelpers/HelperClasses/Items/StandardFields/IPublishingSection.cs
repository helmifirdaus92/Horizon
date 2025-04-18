// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IPublishingSection
    {
        void SetPublishingFromDateTime(DateTime from);
        void SetPublishingToDateTime(DateTime to);
        void SetItemPublishableState(bool isPablishable);
    }
}
