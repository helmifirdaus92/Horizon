// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public class TemplateSection
    {
        public TemplateSection(string name, Dictionary<string, string> fields)
        {
            Name = name;
            Fields = fields;
        }

        public string Name { get; set; }
        public Dictionary<string, string> Fields { get; set; }
    }
}
