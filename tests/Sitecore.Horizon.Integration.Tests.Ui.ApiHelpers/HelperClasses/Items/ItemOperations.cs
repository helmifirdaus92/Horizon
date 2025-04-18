// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Reflection;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.File;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Folder;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Site;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Properties;
using UTF;
using UTF.HelperWebService;
using static Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data.DefaultScData;
using Folder = Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Folder.Folder;
using TemplateItem = Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template.TemplateItem;
using TemplateSection = Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template.TemplateSection;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items
{
    public class ItemOperations : IItemOperations
    {
        private const string HomeItemPath = "/sitecore/content/Home";
        private const string SampleItemTemplate = "/sitecore/templates/Sample/Sample Item";
        private const string SXAHomeItemPath = "/sitecore/content/SXAHeadlessTenant/SXAHeadlessSite/Home";
        private readonly HelperService _helperService;

        public ItemOperations(HelperService helperService)
        {
            _helperService = helperService;
        }

        public PermanentItems PermanentlyCreatedItems => PermanentItems.GetPermanentlyCreatedItems(this, _helperService);

        public MediaLibraryHelper MediaLibraryHelper => new MediaLibraryHelper(this, _helperService);

        public IPageItem CreatePage(PageParams parameters)
        {
            ITemplateItem template = null;
            string templatePath;
            if (parameters.Fields != null)
            {
                template = CreateTemplate(parameters.PageType, parameters.Fields, parameters.DoNotDelete);
                templatePath = template.Path;
            }
            else
            {
                templatePath = parameters.Template
                    ?? (parameters.PageType == LayoutType.Sample ? SampleItemTemplate : PermanentlyCreatedItems.GetSampleTemplateWithMvcPresentation().Path);
            }

            parameters.Template = templatePath;
            parameters.Name = parameters.Name ?? $"TestPage{GetRandomValue()}";
            var page = CreateItem<PageItem>(parameters);
            page.PageType = parameters.PageType;
            if (parameters.WorkflowState != PageWorkflowState.Undefined)
            {
                page.StandardFields.Workflow.SetWorkflowState(parameters.WorkflowState);
            }

            if (parameters.Template == DefaultScData.MvcTemplatePath || parameters.Template == DefaultScData.SampleTemplatePath)
            {
                page.Edit("Title", page.Name);
            }

            if (template != null)
            {
                page.Template = template;
            }

            return page;
        }

        public IPageItem CreatePage(LayoutType pageType = LayoutType.Mvc)
        {
            var parameters = new PageParams(pageType: pageType, workflowState: PageWorkflowState.Draft);
            var page = CreatePage(parameters);
            page.StandardFields.Workflow.SetDefaultWorkflow(DefaultScData.Workflow.SampleWorkflow.WorkflowId);
            return page;
        }

        public IPageItem CreatePageSxa()
        {
            PageParams parameters = new(name: $"TestPage{GetRandomValue()}", parentPath: SXAHomeItemPath, pageType: LayoutType.SXA, template: DefaultScData.SxaHeadlessPageTemplatePath);
            var page = CreateItem<PageItem>(parameters);
            page.PageType = parameters.PageType;

            page.StandardFields.Layout.AddControl(GetItem(DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title)), "headless-main");
            page.Edit("Title", page.Name);

            page.StandardFields.Workflow.SetDefaultWorkflow(DefaultScData.Workflow.SampleWorkflow.WorkflowId);
            page.StandardFields.Workflow.SetWorkflowState(PageWorkflowState.Draft);
            return page;
        }
        public IPageItem CreatePageSxa(PageParams parameters)
        {
            parameters.Template = parameters.Template ?? DefaultScData.SxaHeadlessPageTemplatePath;
            parameters.Name = parameters.Name ?? $"TestPage{GetRandomValue()}";
            parameters.PageType = LayoutType.SXA;
            var page = CreateItem<PageItem>(parameters);
            page.PageType = parameters.PageType;

            page.StandardFields.Layout.AddControl(GetItem(DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title)), "headless-main");
            page.Edit("Title", page.Name);

            page.StandardFields.Workflow.SetDefaultWorkflow(DefaultScData.Workflow.SampleWorkflow.WorkflowId);
            page.StandardFields.Workflow.SetWorkflowState(PageWorkflowState.Draft);
            return page;
        }

        public IGenericItem AddSxaRenderingDataSourceItemToPage(PageItem page, DefaultScData.SxaRenderings rendering, string dsName = null)
        {
            IGenericItem localDataSource = GetPage(page.Path).GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.SxaDataSourceTemplatePath));
            localDataSource ??= AddLocalDataSourceToPage(page);
            if (string.IsNullOrEmpty(dsName))
            {
                int existingDataSource = localDataSource.GetChildren().FindAll(i => i.Template.Path.Equals(DefaultScData.RenderingDataSourceTemplate(rendering))).Count;
                dsName = $"{rendering}_ds_{existingDataSource}";
            }
            IGenericItem item = GetItem(_helperService.CreateItem(dsName, localDataSource.Path, DefaultScData.RenderingDataSourceTemplate(rendering)));
            var (fieldName, id) = DefaultScData.RenderingDataSourceTextFieldDetails(rendering);
            item.Edit(fieldName,dsName);
            return item;
        }

        public IGenericItem AddLocalDataSourceToPage(PageItem page)
        {
            return GetItem(_helperService.CreateItem("Data", page.Path, DefaultScData.SxaDataSourceTemplatePath));
        }

        public void EditFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName, string value)
        {
            GetPage(page.Path)
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.SxaDataSourceTemplatePath))
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.RenderingDataSourceTemplate(rendering)))
                .Edit(fieldName,value);
        }
        public void EditFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering,string fieldName, string value,string language,int version=1)
        {
            GetPage(page.Path)
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.SxaDataSourceTemplatePath))
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.RenderingDataSourceTemplate(rendering)))
                .EditVersion(language,version,fieldName,value);
        }
        public string GetFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName)
        {
            return GetPage(page.Path)
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.SxaDataSourceTemplatePath))
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.RenderingDataSourceTemplate(rendering)))
                .GetFieldValue(fieldName);
        }
        public string GetFieldInSxaComponent(IPageItem page, DefaultScData.SxaRenderings rendering, string fieldName,string language="en", int version=1)
        {
            return GetPage(page.Path)
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.SxaDataSourceTemplatePath))
                .GetChildren().Find(i => i.Template.Path.Equals(DefaultScData.RenderingDataSourceTemplate(rendering)))
                .GetFieldValue(fieldName,language,version);
        }

        public void EditDataFieldInPage(IPageItem page,string value, DefaultScData.SxaRenderings rendering = DefaultScData.SxaRenderings.None,string fieldName=null)
        {
            if (page.PageType == LayoutType.SXA && rendering!=DefaultScData.SxaRenderings.None)
            {
                EditFieldInSxaComponent(page,rendering,DefaultScData.RenderingDataSourceTextFieldDetails(rendering).Item1,value);
            }
            else
            {
                page.Edit(fieldName,value);
            }
        }

        public IRenderingItem CreateRendering(LayoutType layoutType = LayoutType.Mvc, string name = null, byte[] associatedFile = null)
        {
            if (associatedFile == null)
            {
                associatedFile = layoutType == LayoutType.Mvc ? Resources.MvcRendering : Resources.XsltSampleRendering;
            }

            if (name == null)
            {
                name = layoutType == LayoutType.Mvc ? $"MvcRendering{GetRandomValue()}" : $"XslTestRendering{GetRandomValue()}";
            }

            var renderingParams = new RenderingParams(name, associatedFile: associatedFile, doNotDelete: true);
            if (layoutType == LayoutType.Mvc)
            {
                renderingParams.Template = "System/Layout/Renderings/View rendering";
                renderingParams.FileExtension = "cshtml";
            }

            var rendring = CreateRendering(renderingParams);
            return rendring;
        }

        public IRenderingItem CreateRendering(RenderingParams parameters)
        {
            parameters.Name = parameters.Name ?? $"TestRendering_{GetRandomValue()}";
            parameters.ParentPath = parameters.ParentPath ?? "/sitecore/layout/Renderings";
            parameters.Placeholder = parameters.Placeholder ?? "content";
            parameters.Template = parameters.Template ?? "System/Layout/Renderings/Xsl Rendering";
            parameters.FileExtension = parameters.FileExtension ?? "xslt";
            parameters.FileFolder = parameters.FileFolder ?? "/layouts/debug";
            parameters.AssociatedFileContent = parameters.AssociatedFileContent ?? Resources.XsltSampleRendering;

            var rendering = CreateItemWithAssociatedFile<RenderingItem>(parameters);

            if (!string.IsNullOrEmpty(parameters.DatasourceTemplate))
            {
                _helperService.EditItem(rendering.Id, "Datasource Template", parameters.DatasourceTemplate);
                rendering.DatasourceTemplate = parameters.DatasourceTemplate;
            }

            return rendering;
        }

        public IGenericItem CreateOrEditPlaceholderSettings(string name, string placeholderKey = "", List<string> allowedControlsIds = null)
        {
            var options = new ItemParams();
            options.Name = name;
            options.Template = DefaultScData.GenericItems.PlaceholderSettingsTemplateId;
            options.ParentPath = DefaultScData.GenericItems.PlaceholderSettingFolderPath;
            var placeholderSettingsItem = GetItem(options.ParentPath + Path.AltDirectorySeparatorChar + options.Name) ?? CreateItem(options);
            placeholderSettingsItem.Edit("Placeholder Key", placeholderKey);
            string finalAllowedControlsRawValue = placeholderSettingsItem.GetFieldValue("Allowed Controls");
            if (allowedControlsIds != null)
            {
                allowedControlsIds.ForEach(control => finalAllowedControlsRawValue += control + "|");
                placeholderSettingsItem.Edit("Allowed Controls", finalAllowedControlsRawValue);
            }

            return placeholderSettingsItem;
        }

        public ILayoutItem CreateLayout(LayoutType layoutType)
        {
            return CreateLayout(layoutType == LayoutType.Mvc
                ? new LayoutParams($"TestMvcLayout{GetRandomValue()}", associatedFileContent: Resources.MvcLayout, fileExtension: "cshtml", doNotDelete: true)
                : new LayoutParams($"TestSampleLayout{GetRandomValue()}", doNotDelete: true));
        }

        public ILayoutItem CreateLayout(LayoutParams parameters)
        {
            parameters.Name = parameters.Name ?? $"TestLayout_{GetRandomValue()}";
            parameters.ParentPath = parameters.ParentPath ?? "/sitecore/layout/Layouts";
            parameters.Template = parameters.Template ?? "System/Layout/Layout";
            parameters.FileExtension = parameters.FileExtension ?? "aspx";
            parameters.FileFolder = parameters.FileFolder ?? "/layouts/debug";

            LayoutItem layout;
            if (parameters.AssociatedFileContent != null)
            {
                layout = CreateItemWithAssociatedFile<LayoutItem>(parameters);
            }
            else
            {
                string filePath = $"{parameters.FileFolder}/{parameters.Name}.{parameters.FileExtension}";
                IGenericFile file = CreateFile(filePath, Resources.SampleLayout, parameters.DoNotDelete);
                layout = CreateItem<LayoutItem>(parameters);
                layout.AssociatedFile = file;
                _helperService.EditItem(layout.Id, "Path", filePath, (Database)parameters.Database);
            }

            return layout;
        }

        public ITemplateItem CreateTemplate(string baseTemplate, List<TemplateSection> fields = null)
        {
            var parameters = new TemplateParams(baseTemplate: baseTemplate, fieldsSections: fields);
            return CreateTemplate(parameters);
        }

        public ITemplateItem CreateTemplate(TemplateParams parameters = null)
        {
            if (parameters == null)
            {
                parameters = new TemplateParams();
            }

            parameters.Name = parameters.Name ?? $"TestTemplate{new Random().Next()}";
            parameters.BaseTemplate = parameters.BaseTemplate ?? "System/Templates/Standard template";
            parameters.ParentPath = parameters.ParentPath ?? "/sitecore/templates";

            ITemplateItem template;
            string templatePath = parameters.ParentPath + "/" + parameters.Name;
            if (string.IsNullOrEmpty(_helperService.GetItemIdByPath(templatePath)))
            {
                string path = _helperService.CreateTemplate(parameters.Name
                    , parameters.ParentPath
                    , parameters.BaseTemplate
                    , Settings.AdminUser
                    , Settings.AdminPassword
                    , (Database)parameters.Database);

                template = GetTemplate(path);
                if (parameters.FieldsSections != null)
                {
                    foreach (TemplateSection section in parameters.FieldsSections)
                    {
                        foreach (KeyValuePair<string, string> field in section.Fields)
                        {
                            template.AddField(section.Name, field.Key, field.Value);
                        }
                    }
                }
            }
            else
            {
                template = GetTemplate(templatePath);
                Logger.WriteLineWithTimestamp("New template is NOT created! Item '{0}' already exist", templatePath);
            }

            if (parameters.HasStandardValues)
            {
                IGenericItem standardValues = template.CreateStandardValues();
                standardValues.DoNotDelete = parameters.DoNotDelete;
            }

            template.DoNotDelete = parameters.DoNotDelete;
            TestData.ItemsToDelete.Add(template);
            return template;
        }

        public ITemplateItem GetTemplate(string itemPath, DatabaseType database = DatabaseType.Master)
        {
            return GetItem<TemplateItem>(itemPath, database);
        }

        public IFolder CreateFolder(string parentPath = null, string name = null, DatabaseType database = DatabaseType.Master, bool doNotDelete = false)
        {
            var itemParams = new ItemParams(name, parentPath, template: DefaultScData.GenericItems.FolderTemplateId, database: database, doNotDelete: doNotDelete);
            return CreateItem<Folder>(itemParams);
        }

        public IPageItem GetPage(string itemIdOrPath, DatabaseType database = DatabaseType.Master)
        {
            return GetItem<PageItem>(itemIdOrPath, database);
        }

        public ISiteItem GetSite(string itemIdOrPath, DatabaseType database = DatabaseType.Master)
        {
            return GetItem<SiteItem>(itemIdOrPath, database);
        }

        public IGenericItem GetItem(string itemIdOrPath, DatabaseType database = DatabaseType.Master)
        {
            return GetItem<GenericItem>(itemIdOrPath, database);
        }

        public IGenericItem CreateItem(ItemParams parameters = null)
        {
            if (parameters == null)
            {
                parameters = new ItemParams();
            }

            return CreateItem<GenericItem>(parameters);
        }

        public T CreateItem<T>(ItemParams parameters) where T : IGenericItem
        {
            parameters.Name = parameters.Name ?? $"TestItem{GetRandomValue()}";
            parameters.ParentPath = parameters.ParentPath ?? HomeItemPath;
            parameters.Template = parameters.Template ?? SampleItemTemplate;

            string itemPath = parameters.ParentPath + "/" + parameters.Name;
            bool itemAlreadyExists = !string.IsNullOrEmpty(_helperService.GetItemIdByPath(itemPath, (Database)parameters.Database));
            if (!itemAlreadyExists)
            {
                if (parameters.Id == null)
                {
                    itemPath = _helperService.CreateItem(parameters.Name, parameters.ParentPath, parameters.Template, false, (Database)parameters.Database);
                }
                else
                {
                    itemPath = _helperService.CreateItemWithId(parameters.Name, parameters.Id, parameters.ParentPath, parameters.Template, false, (Database)parameters.Database);
                }

                Logger.WriteLineWithTimestamp($"New item is created: {parameters.ParentPath}/{parameters.Name}");
            }
            else
            {
                Logger.WriteLineWithTimestamp("New item is NOT created! Item '{0}' already exist. Database: '{1}'", itemPath, parameters.Database);
            }

            BindingFlags flags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
            var arguments = new object[]
            {
                itemPath,
                parameters.Database,
                _helperService
            };
            var item = (T)Activator.CreateInstance(typeof(T), flags, null, arguments, null);
            item.DoNotDelete = parameters.DoNotDelete;
            TestData.ItemsToDelete.Add(item);
            return item;
        }

        public IGenericFile CreateFile(string filePath, byte[] content, bool doNotDelete, bool overrideIfExist = false)
        {
            string parentFolderPath = Path.GetDirectoryName(filePath);
            string fileName = Path.GetFileName(filePath);
            if (!_helperService.FileOrFolderExists(filePath) || overrideIfExist)
            {
                _helperService.DeleteFilesAndFolders(parentFolderPath, fileName);
                _helperService.UploadFile(content, fileName, parentFolderPath);
            }
            else
            {
                Logger.WriteLineWithTimestamp("New file is NOT created! File '{0}' already exist'", filePath);
            }

            var file = new GenericFile(filePath)
            {
                DoNotDelete = doNotDelete,
                Content = content
            };
            TestData.FilesToDelete.Add(file);
            return file;
        }

        public string[] GetFileNames(string folderPath)
        {
            return _helperService.GetFileNames(folderPath);
        }

        public byte[] GetFileContent(string filePath)
        {
            return _helperService.GetFileContent(filePath);
        }

        public void DeleteFile(string filePath)
        {
            string parentFolderPath = Path.GetDirectoryName(filePath);
            string fileName = Path.GetFileName(filePath);
            if (_helperService.FileOrFolderExists(filePath))
            {
                _helperService.DeleteFilesAndFolders(parentFolderPath, fileName);
            }
        }

        public bool IsItemExist(IGenericItem item, DatabaseType database = DatabaseType.Master)
        {
            return _helperService.GetItemPathById(item.Id, (Database)database) != null;
        }

        public IGenericItem AddDanishLanguage(string fallbackLanguage = null)
        {
            return AddLanguage("da", "da", fallbackLanguage: fallbackLanguage, doNotRemoveLanguage: true);
        }

        public IGenericItem AddLanguage(string iso, string regionalIsoCode, string charset = "iso-8859-1",
            string fallbackLanguage = null, bool doNotRemoveLanguage = false)
        {
            var path = $"/sitecore/system/Languages/{regionalIsoCode}";
            var language = GetItem(path);
            if (language == null)
            {
                var itemPath = _helperService.CreateItem(regionalIsoCode, "{64C4F646-A3FA-4205-B98E-4DE2C609B60F}", "{F68F13A6-3395-426A-B9A1-FA2DC60D94EB}");
                _helperService.EditItem(itemPath, "Charset", charset);
                _helperService.EditItem(itemPath, "Code page", "65001");
                _helperService.EditItem(itemPath, "Encoding", "utf-8");
                _helperService.EditItem(itemPath, "Iso", iso);
                _helperService.EditItem(itemPath, "Regional Iso Code", regionalIsoCode);
                language = new GenericItem(itemPath, DatabaseType.Master, _helperService);
                language.DoNotDelete = doNotRemoveLanguage;
                TestData.ItemsToDelete.Add(language);
            }

            if (fallbackLanguage != null)
            {
                _helperService.EditItem(language.Path, "Fallback Language", fallbackLanguage);
            }

            return language;
        }

        public void DeleteItem(string itemId, DatabaseType database = DatabaseType.Master)
        {
            _helperService.DeleteItem(itemId, (Database)database);
        }

        public ITemplateItem CreateTemplate(LayoutType pageType, List<PageField> fields, bool doNotDelete = false)
        {
            var fieldsSections = new List<TemplateSection>
            {
                new TemplateSection("Data", new Dictionary<string, string>())
            };
            foreach (PageField field in fields)
            {
                string value = null;
                switch (field.FieldType)
                {
                    case PageFieldType.Date:
                    case PageFieldType.Datetime:
                    case PageFieldType.Image:
                    case PageFieldType.Number:
                    case PageFieldType.Password:
                    case PageFieldType.Integer:
                    case PageFieldType.Text:
                        value = field.FieldType.ToString();
                        break;
                    case PageFieldType.MultiLineText:
                        value = "Multi-Line Text";
                        break;
                    case PageFieldType.SingleLineText:
                        value = "Single-Line Text";
                        break;
                    case PageFieldType.GeneralLink:
                        value = "General Link";
                        break;
                    case PageFieldType.GeneralLinkWithSearch:
                        value = "General Link with Search";
                        break;
                    case PageFieldType.RichText:
                        value = "Rich Text";
                        break;
                    case PageFieldType.MessageText:
                        value = "Message Text";
                        break;
                    case PageFieldType.CheckBox:
                        value = "Checkbox";
                        break;
                    case PageFieldType.CheckList:
                        value = "Checklist";
                        break;
                    case PageFieldType.DropLink:
                        value = "Droplink";
                        break;
                    case PageFieldType.DropTree:
                        value = "Droptree";
                        break;
                    case PageFieldType.DropList:
                        value = "Droplist";
                        break;
                }

                fieldsSections[0].Fields.Add(field.FieldName, value);
            }

            var parameters = new TemplateParams(fieldsSections: fieldsSections, hasStandardValues: true, doNotDelete: doNotDelete);
            ITemplateItem template = CreateTemplate(parameters);

            //Set test data
            foreach (PageField field in fields)
            {
                if (field.Value != null)
                {
                    template.StandardValues.Edit(field.FieldName, field.Value);
                }

                // template.Fields.Add(field.FieldName, field);
            }

            ILayoutItem layout = CreateLayout(pageType);
            byte[] renderingFile = PresentationHelper.GenerateRenderingFile(pageType, fields);
            IRenderingItem customRendering = CreateRendering(pageType, $"CustomRendering{new Random().Next()}", renderingFile);
            template.StandardValues.StandardFields.Layout.AssignLayout(layout).AddControl(customRendering);
            return template;
        }

        public T GetItem<T>(string itemIdOrPath, DatabaseType database) where T : class, IGenericItem
        {
            string itemId = null;
            string itemPath = null;
            if (Guid.TryParse(itemIdOrPath, out _))
            {
                itemPath = _helperService.GetItemPathById(itemIdOrPath, (Database)database);
            }
            else
            {
                itemId = _helperService.GetItemIdByPath(itemIdOrPath, (Database)database);
            }

            if (itemId == null && itemPath == null)
            {
                return null;
            }

            BindingFlags flags = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance;
            var arguments = new object[]
            {
                itemIdOrPath,
                database,
                _helperService
            };
            var item = (T)Activator.CreateInstance(typeof(T), flags, null, arguments, null);
            return item;
        }

        private static string GetRandomValue()
        {
            return Guid.NewGuid().ToString().Substring(0, 5);
        }

        private T CreateItemWithAssociatedFile<T>(LayoutParams parameters) where T : IPresentationItem
        {
            IGenericFile file = null;
            string filePath = $"{parameters.FileFolder}/{parameters.Name}.{parameters.FileExtension}";
            if (parameters.AssociatedFileContent != null)
            {
                file = CreateFile(filePath, parameters.AssociatedFileContent, parameters.DoNotDelete);
            }
            else
            {
                Logger.WriteLineWithTimestamp("File '{0}' can not be created - content is empty'", filePath);
            }

            var itemWithFile = CreateItem<T>(parameters);
            _helperService.EditItem(itemWithFile.Id, "Path", filePath, (Database)parameters.Database);
            itemWithFile.AssociatedFile = file;
            return itemWithFile;
        }
    }
}
