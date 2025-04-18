// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using UTF;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public class TemplateItem : GenericItem, ITemplateItem
    {
        private readonly Dictionary<string, string> _fields;
        private DatabaseType _database;
        private readonly string SxaTemplatesPath = "/sitecore/templates/Feature/JSS Experience Accelerator";

        public TemplateItem(string itemIdOrPath, DatabaseType database, HelperService helperService) : base(itemIdOrPath, database, helperService)
        {
            _fields = new Dictionary<string, string>();
            _database = database;
        }

        private string _section => Path.StartsWith(SxaTemplatesPath) ? Name : "Data";

        public IGenericItem StandardValues { get; private set; }

        public Dictionary<string, string> Fields => _fields;

        public void AddField(string section, string fieldName, string fieldType)
        {
            string fieldPath = HelperService.AddTemplateField(Path, section, fieldName, (Database)Database);
            HelperService.EditItem(fieldPath, "Type", fieldType, (Database)Database);
            _fields.Add(fieldName, HelperService.GetItemIdByPath(fieldPath));
        }

        public IGenericItem CreateStandardValues()
        {
            string stdValPath = $"{Path}/__Standard Values";
            if (string.IsNullOrEmpty(HelperService.GetItemIdByPath(stdValPath, (Database)Database)))
            {
                HelperService.CreateStandardValues(Path, (Database)Database);
            }
            else
            {
                Logger.WriteLineWithTimestamp("New Standard values item is NOT created! Item '{0}' already exist'", stdValPath);
            }

            StandardValues = new GenericItem(stdValPath, Database, HelperService);
            return StandardValues;
        }

        public ITemplateFieldItem GetTemplateField(string fieldName)
        {  
            var chidren = HelperService.GetChildren(Path + $"/{_section}/", (Database)Database, true);
            foreach (var child in chidren)
            {
                if (child.Contains(fieldName))
                {
                    return new TemplateFieldItem(child, Database, HelperService);
                }
            }

            return null;
        }


        public List<ITemplateFieldItem> GetAllTemplateFields()
        {
            var fields = new List<ITemplateFieldItem>();
            var templateSectionId = HelperService.GetChildren($"{Path}/", (Database)Database, true)[0];
            var chidren = HelperService.GetChildren(templateSectionId, (Database)Database, true);
            foreach (var child in chidren)
            {
                fields.Add(new TemplateFieldItem(child, Database, HelperService));
            }

            return fields;
        }
    }
}
