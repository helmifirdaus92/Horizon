// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public class TemplateParams : ItemParams
    {
        public TemplateParams(string name = null, string baseTemplate = null, List<TemplateSection> fieldsSections = null, string parentPath = null, string path = null, bool hasStandardValues = false, DatabaseType database = DatabaseType.Master, bool doNotDelete = false, string id = null)
            : base(name, parentPath, path, "/sitecore/System/Templates/Template", database, doNotDelete, id)
        {
            FieldsSections = fieldsSections;
            BaseTemplate = baseTemplate;
            HasStandardValues = hasStandardValues;
        }

        public string BaseTemplate { get; set; }
        public List<TemplateSection> FieldsSections { get; set; }

        public bool HasStandardValues { get; set; }
    }
}
