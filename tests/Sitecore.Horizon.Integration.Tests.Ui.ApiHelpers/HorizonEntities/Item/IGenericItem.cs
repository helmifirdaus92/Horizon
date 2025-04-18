// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.DataFields;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item
{
    public interface IGenericItem
    {
        DatabaseType Database { get; }
        bool DoNotDelete { get; set; }
        string Id { get; }
        string ShortId { get; }
        string Name { get; set; }
        string Path { get; set; }
        ITemplateItem Template { get; set; }
        IItemStandardFields StandardFields { get; }
        ItemDataFields DataFields { get; }
        void UpdateItemData();
        void AddVersion(string language);
        void DeleteVersion(string language, int version);
        void Edit(string fieldName, string fieldValue);
        void EditVersion(string language, int version, string fieldName, string fieldValue);
        int GetVersionsCount(string language);
        string GetFieldValue(string fieldName, string language = "en", int version = 1);
        IGenericItem CreateChildItem(string template);
        T CreateChildItem<T>(string template) where T : IGenericItem;
        IPageItem CreateChildPage(LayoutType pageType = LayoutType.Mvc);
        IGenericItem GetParentItem();
        List<IGenericItem> GetSiblings();
        List<IGenericItem> GetChildren();
        void Rename(string newName);
        void Publish();
        void Publish(string[] languages, bool includeSubItems = false, bool publishRelatedItems = false, bool compareRevisions = true);
        void Move(IGenericItem newParent);
        void Delete();
        void Delete(string language, int version);
        string GetDisplayName(string language = "en");
        void SetDisplayName(string displayName, string language = "en", int version = 1);
        void ChangeTemplate(string templateIdOrPath);
    }
}
