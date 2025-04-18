// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Folder;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Site;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items
{
    public interface IItemOperations
    {
        PermanentItems PermanentlyCreatedItems { get; }
        MediaLibraryHelper MediaLibraryHelper { get; }
        T CreateItem<T>(ItemParams parameters) where T : IGenericItem;
        IGenericItem CreateItem(ItemParams itemParams = null);
        IGenericFile CreateFile(string filePath, byte[] content, bool doNotDelete, bool overrideIfExist = false);
        string[] GetFileNames(string folderPath);
        byte[] GetFileContent(string filePath);
        void DeleteFile(string filePath);
        IPageItem CreatePage(PageParams parameters);
        IPageItem CreatePage(LayoutType pageType = LayoutType.Mvc);
        IPageItem CreatePageSxa();
        IPageItem CreatePageSxa(PageParams parameters);
        IGenericItem AddSxaRenderingDataSourceItemToPage(PageItem page, DefaultScData.SxaRenderings rendering, string dsName);
        void EditFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName, string value);
        void EditFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName, string value, string language, int version);
        void EditDataFieldInPage(IPageItem page,string value, DefaultScData.SxaRenderings rendering = DefaultScData.SxaRenderings.None,string fieldName=null);
        string GetFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName);
        string GetFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName,string language="en", int version=1);
        IPageItem GetPage(string itemPath, DatabaseType database = DatabaseType.Master);
        ISiteItem GetSite(string itemPath, DatabaseType database = DatabaseType.Master);
        ITemplateItem CreateTemplate(string baseTemplate, List<TemplateSection> fields);
        ITemplateItem CreateTemplate(LayoutType pageType, List<PageField> fields, bool doNotDelete = false);
        ITemplateItem CreateTemplate(TemplateParams parameters = null);
        ITemplateItem GetTemplate(string itemPath, DatabaseType database = DatabaseType.Master);
        IFolder CreateFolder(string parentPath = null, string name = null, DatabaseType database = DatabaseType.Master, bool doNotDelete = false);
        ILayoutItem CreateLayout(LayoutType layoutType);
        ILayoutItem CreateLayout(LayoutParams parameters);
        IRenderingItem CreateRendering(LayoutType layoutType = LayoutType.Mvc, string name = null, byte[] associatedFile = null);
        IRenderingItem CreateRendering(RenderingParams parameters);
        IGenericItem CreateOrEditPlaceholderSettings(string name, string placeholderKey = "", List<string> allowedControlsIds = null);
        void DeleteItem(string itemId, DatabaseType database = DatabaseType.Master);
        IGenericItem GetItem(string itemIdOrPath, DatabaseType database = DatabaseType.Master);
        T GetItem<T>(string itemIdOrPath, DatabaseType database) where T : class, IGenericItem;
        bool IsItemExist(IGenericItem item, DatabaseType database = DatabaseType.Master);
        IGenericItem AddDanishLanguage(string fallbackLanguage = null);

        IGenericItem AddLanguage(string iso, string regionalIsoCode, string charset = "iso-8859-1",
            string fallbackLanguage = null, bool doNotRemoveLanguage = false);
    }
}
