// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation
{
    public class PresentationItem : GenericItem, IPresentationItem
    {
        public PresentationItem(string itemIdOrPath, DatabaseType database, HelperService helperService)
            : base(itemIdOrPath, database, helperService)
        {
        }

        public PresentationItem(IGenericFile associatedFile, string itemIdOrPath, DatabaseType database, HelperService helperService)
            : this(itemIdOrPath, database, helperService)
        {
            AssociatedFile = associatedFile;
        }

        public IGenericFile AssociatedFile { get; set; }
    }
}
