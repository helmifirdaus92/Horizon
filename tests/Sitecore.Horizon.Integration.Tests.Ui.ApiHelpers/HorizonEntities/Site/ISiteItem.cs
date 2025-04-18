// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Site;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Site;

public interface ISiteItem : IGenericItem
{
    public ISiteSettingsSection Settings { get; }
}
