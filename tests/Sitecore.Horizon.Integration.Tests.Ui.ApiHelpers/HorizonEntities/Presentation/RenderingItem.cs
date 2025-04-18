// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation
{
    public class RenderingItem : PresentationItem, IRenderingItem
    {
        private string datasourceTemplateField = "Datasource Template";
        private string datasourceLocationField = "Datasource Location";

        public RenderingItem(string itemIdOrPath, DatabaseType database, HelperService helperService)
            : base(itemIdOrPath, database, helperService)
        {
        }


        public string DatasourceTemplate
        {
            get => HelperService.GetItemFieldValue(Path, datasourceTemplateField);
            set => HelperService.EditItem(Path, datasourceTemplateField, value, (Database)Database);
        }

        public string DatasourceLocation
        {
            get => HelperService.GetItemFieldValue(Path, datasourceLocationField);
            set => HelperService.EditItem(Path, datasourceLocationField, value, (Database)Database);
        }
    }
}
