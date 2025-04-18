// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation
{
    public class LayoutItem : PresentationItem, ILayoutItem
    {
        public LayoutItem(string itemIdOrPath, DatabaseType database, HelperService helperService)
            : base(itemIdOrPath, database, helperService)
        {
        }

        public LayoutItem(IGenericFile associatedFile, string itemIdOrPath, DatabaseType database, HelperService helperService)
            : base(itemIdOrPath, database, helperService)
        {
        }
    }
}
