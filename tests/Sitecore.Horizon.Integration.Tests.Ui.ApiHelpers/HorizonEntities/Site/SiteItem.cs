// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Site;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Site;

public class SiteItem : GenericItem,ISiteItem
{
    public SiteItem(string itemIdOrPath, DatabaseType database, HelperService helperService) : base(itemIdOrPath, database, helperService)
    {
        Settings = new SiteSettingsSection(itemIdOrPath, database, helperService);
    }
    public ISiteSettingsSection Settings { get; set; }
} 
