// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation
{
    public class LayoutParams : ItemParams
    {
        public LayoutParams(string name = null, string parentPath = null, string path = null, byte[] associatedFileContent = null, string fileExtension = null, string fileFolder = null, string template = null, DatabaseType database = DatabaseType.Master, bool doNotDelete = false, string id = null)
            : base(name, parentPath, path, template, database, doNotDelete, id)
        {
            AssociatedFileContent = associatedFileContent;
            FileExtension = fileExtension;
            FileFolder = fileFolder;
        }

        public byte[] AssociatedFileContent { get; set; }
        public object FileExtension { get; set; }
        public string FileFolder { get; set; }
    }
}
