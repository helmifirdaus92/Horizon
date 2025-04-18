// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template
{
    public interface ITemplateItem : IGenericItem
    {
        IGenericItem StandardValues { get; }
        Dictionary<string, string> Fields { get; }
        List<ITemplateFieldItem> GetAllTemplateFields();
        void AddField(string section, string fieldName, string fieldType);
        IGenericItem CreateStandardValues();
        ITemplateFieldItem GetTemplateField(string fieldName);
    }
}
