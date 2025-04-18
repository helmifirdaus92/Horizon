// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page
{
    public class PageItem : GenericItem, IPageItem
    {
        internal PageItem(string itemIdOrPath, DatabaseType database, HelperService helperService) : base(itemIdOrPath, database, helperService)
        {
            StandardFields = new PageStandardFields(itemIdOrPath, database, helperService);
        }

        public LayoutType PageType { get; internal set; }
        public new IPageStandardFields StandardFields { get; private set; }

        public override void Rename(string newName)
        {
            base.Rename(newName);
            StandardFields = new PageStandardFields(Path, Database, HelperService);
        }
    }
}
