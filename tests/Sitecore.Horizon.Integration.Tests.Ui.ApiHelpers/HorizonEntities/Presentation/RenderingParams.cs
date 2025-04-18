// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation
{
    public class RenderingParams : LayoutParams
    {
        public RenderingParams(string name = null, string parentPath = null, string path = null, byte[] associatedFile = null, string fileExtension = null, string fileFolder = null, string placeholder = null, string datasource = null, string template = null, DatabaseType database = DatabaseType.Master, bool doNotDelete = false, string id = null)
            : base(name, parentPath, path, associatedFile, fileExtension, fileFolder, template, database, doNotDelete, id)
        {
            Placeholder = placeholder;
            Datasource = datasource;
        }

        public string Placeholder { get; set; }
        public string Datasource { get; set; }
        public string DatasourceTemplate { get; set; }
    }
}
