// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Folder
{
    public class Folder : GenericItem, IFolder
    {
        public Folder(string itemIdOrPath, DatabaseType database, HelperService helperService) : base(itemIdOrPath, database, helperService)
        {
        }

        public IFolder CreateSubFolder(string name = null)
        {
            var items = new ItemOperations(HelperService);
            return items.CreateFolder(Path, name, Database);
        }
    }
}
