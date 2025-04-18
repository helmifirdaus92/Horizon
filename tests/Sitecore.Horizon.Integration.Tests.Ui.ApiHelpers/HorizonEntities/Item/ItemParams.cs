// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item
{
    public class ItemParams
    {
        /// <summary>
        ///     The DoNotDelete
        ///     If set to true - item will not be added to ItemToRemove collection
        /// </summary>
        public bool DoNotDelete;

        public string Name;
        public string Id;
        public string ParentPath;
        public string Path;
        public string Template;
        public DatabaseType Database;

        public ItemParams(string name = null, string parentPath = null, string path = null, string template = "Sample/Sample Item", DatabaseType database = DatabaseType.Master, bool doNotDelete = false, string id = null)
        {
            Path = path;
            Name = name;
            ParentPath = parentPath;
            if (string.IsNullOrEmpty(Path) && !string.IsNullOrEmpty(ParentPath) && !string.IsNullOrEmpty(Name))
            {
                Path = $"{ParentPath}/{Name}";
            }

            if ((string.IsNullOrEmpty(Name) || string.IsNullOrEmpty(ParentPath)) && !string.IsNullOrEmpty(Path))
            {
                Name = Path.Split(new[]
                {
                    "/"
                }, StringSplitOptions.RemoveEmptyEntries).Last();
                ParentPath = Path.Remove(Path.Length - Name.Length - 1);
            }

            Template = template;
            Id = id;
            Database = database;
            DoNotDelete = doNotDelete;
        }
    }
}
