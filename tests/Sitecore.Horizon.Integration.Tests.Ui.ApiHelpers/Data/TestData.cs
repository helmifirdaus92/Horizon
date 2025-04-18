// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data
{
    public class TestData
    {
        private static HelperService _helperService;
        public static List<IGenericItem> ItemsToDelete { get; private set; }
        public static List<IGenericFile> FilesToDelete { get; private set; }


        public static void Init(HelperService service)
        {
            ItemsToDelete = new List<IGenericItem>();
            FilesToDelete = new List<IGenericFile>();
            _helperService = service;
        }


        public static void ClearItem(string itemId)
        {
            _helperService.DeleteItemWithoutException(itemId);
        }

        public static void ClearItems(bool keepProtected = true)
        {
            foreach (IGenericItem item in ItemsToDelete)
            {
                if (item.DoNotDelete && keepProtected)
                {
                    continue;
                }

                //it can be that collection contain few instances of same item, but one of them is protected from deletion
                if (ItemsToDelete.Any(i => (i != item) && (i.Id == item.Id) && (i.DoNotDelete)))
                {
                    continue;
                }

                _helperService.DeleteItemWithoutException(item.Id, (Database)item.Database);
                Logger.WriteLineWithTimestamp("Item was deleted. Path:  '{0}'. Id: '{1}'. Database: '{2}'", item.Path, item.Id, item.Database);
            }

            if (keepProtected)
            {
                ItemsToDelete.RemoveAll(i => !i.DoNotDelete);
            }
            else
            {
                ItemsToDelete.Clear();
            }
        }

        public static void ClearFiles(bool keepProtected = true)
        {
            foreach (IGenericFile file in FilesToDelete)
            {
                if (file.DoNotDelete && keepProtected)
                {
                    continue;
                }

                //it can be that collection contain few instances of same file, but one of them is protected from deletion
                if (FilesToDelete.Any(f => (f != file) && (f.FilePath == file.FilePath) && (f.DoNotDelete) && keepProtected))
                {
                    continue;
                }

                try
                {
                    _helperService.DeleteFilesAndFolders(file.ParentFolderPath, file.FileName);
                    Logger.WriteLineWithTimestamp("File  was deleted: '{0}'", file.FilePath);
                }
                catch
                {
                    Logger.WriteLineWithTimestamp("Exception caught while deleting file '{0}'", file.FilePath);
                }
            }

            if (keepProtected)
            {
                FilesToDelete.RemoveAll(i => !i.DoNotDelete);
            }
            else
            {
                FilesToDelete.Clear();
            }
        }
    }
}
