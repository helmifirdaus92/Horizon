// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.DataFields;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item
{
    public class GenericItem : IGenericItem
    {
        internal readonly HelperService HelperService;
        private ITemplateItem _template;

        public GenericItem(string itemIdOrPath, DatabaseType database, HelperService helperService)
        {
            HelperService = helperService;
            Database = database;
            if (Guid.TryParse(itemIdOrPath, out Guid _))
            {
                Id = itemIdOrPath;
                Path = HelperService.GetItemPathById(itemIdOrPath);
            }
            else
            {
                Id = HelperService.GetItemIdByPath(itemIdOrPath);
                Path = itemIdOrPath;
            }

            Name = System.IO.Path.GetFileName(Path);
            StandardFields = new ItemStandardFields(Path, database, HelperService);
            DataFields = new ItemDataFields(Path, database, HelperService);
        }

        public IItemStandardFields StandardFields { get; private set; }

        public ItemDataFields DataFields { get; private set; }

        public DatabaseType Database { get; }

        public ITemplateItem Template
        {
            get
            {
                if (_template == null)
                {
                    var templatePath = "/sitecore/templates/" + HelperService.GetItemTemplate(Path, (Database)Database);
                    _template = new TemplateItem(templatePath, Database, HelperService);
                }

                return _template;
            }
            set => _template = value;
        }

        public string Id { get; }

        public string ShortId => Id.Replace("}", "").Replace("{", "");

        public string Name { get; set; }
        public string Path { get; set; }

        public bool DoNotDelete { get; set; }

        public void UpdateItemData()
        {
            Path = HelperService.GetItemPathById(Id);
            Name = System.IO.Path.GetFileName(Path);
            StandardFields = new ItemStandardFields(Path, Database, HelperService);
            DataFields = new ItemDataFields(Path, Database, HelperService);
        }

        public void AddVersion(string language)
        {
            HelperService.AddItemVersion(Path, language);
            if (!Template.Path.ToLower().Contains(DefaultScData.GenericItems.SystemTemplatesPath.ToLower()))
            {
                StandardFields.Workflow.SetWorkflowState(DefaultScData.Workflow.SampleWorkflow.WorkflowId,
                    DefaultScData.Workflow.SampleWorkflow.WorkflowStateDraft, language, GetVersionsCount(language));
            }
        }

        public void EditVersion(string language, int version, string fieldName, string fieldValue)
        {
            HelperService.EditItemVersion(Path, language, version, fieldName, fieldValue, (Database)Database);
        }

        public void DeleteVersion(string language, int version)
        {
            HelperService.DeleteItemVersion(Path, language, version, (Database)Database);
        }

        public int GetVersionsCount(string language)
        {
            return HelperService.GetItemVersionsCount(Path, language, (Database)Database);
        }

        public void Edit(string fieldName, string fieldValue)
        {
            HelperService.EditItem(Path, fieldName, fieldValue, (Database)Database);
        }

        public string GetFieldValue(string fieldName, string language = "en", int version = 1)
        {
            if (Database == DatabaseType.Web)
            {
                return HelperService.GetItemFieldValue(Id, fieldName, (Database)Database, language);
            }
            else
            {
                return HelperService.GetItemVersionFieldValue(Id, fieldName, (Database)Database, language, version);
            }
        }

        public IGenericItem GetParentItem()
        {
            string parentPath = System.IO.Path.GetDirectoryName(Path)?.Replace("\\", "/");
            return new GenericItem(parentPath, Database, HelperService);
        }

        public List<IGenericItem> GetSiblings()
        {
            var siblings = new List<IGenericItem>();
            string parentPath = System.IO.Path.GetDirectoryName(Path)?.Replace("\\", "/");
            var childrenIds = HelperService.GetChildren(parentPath, (Database)Database, true);
            foreach (var childId in childrenIds)
            {
                var item = new GenericItem(childId, Database, HelperService);
                if (item.Id != Id)
                {
                    siblings.Add(item);
                }
            }

            return siblings;
        }

        public List<IGenericItem> GetChildren()
        {
            var children = new List<IGenericItem>();
            var childrenIds = HelperService.GetChildren(Path, (Database)Database, true);
            foreach (var childId in childrenIds)
            {
                var item = new GenericItem(childId, Database, HelperService);
                if (item.Id != Id)
                {
                    children.Add(item);
                }
            }

            return children;
        }

        public void Publish()
        {
            Publish(new[]
            {
                "en"
            });
        }

        public void Publish(string[] languages, bool includeSubItems = false, bool publishRelatedItems = false, bool compareRevisions = true)
        {
            HelperService.PublishItem(Id, languages, includeSubItems, publishRelatedItems, compareRevisions, new[]
            {
                DefaultScData.Publishing.InternetTarget
            });
        }

        public void Move(IGenericItem newParent)
        {
            HelperService.MoveItem(Id, newParent.Id);
            Path = HelperService.GetItemPathById(Id);
        }

        public void Delete()
        {
            HelperService.DeleteItem(Id);
        }

        public void Delete(string language, int version)
        {
            HelperService.DeleteItemVersion(Id, language, version, (Database)Database);
        }

        public IGenericItem CreateChildItem(string template)
        {
            return CreateChildItem<GenericItem>(template);
        }

        public T CreateChildItem<T>(string template) where T : IGenericItem
        {
            var items = new ItemOperations(HelperService);
            return items.CreateItem<T>(new ItemParams(parentPath: Path, template: template, database: Database));
        }

        public IPageItem CreateChildPage(LayoutType pageType)
        {
            var items = new ItemOperations(HelperService);
            if (pageType == LayoutType.SXA)
            {
                return items.CreatePageSxa(new PageParams(parentPath: Path, pageType: pageType, database: Database));
            }
            else
            {
                return items.CreatePage(new PageParams(parentPath: Path, pageType: pageType, database: Database));
            }
        }

        public virtual void Rename(string newName)
        {
            HelperService.RenameItem(Id, newName, (Database)Database);
            Name = newName;
            Path = HelperService.GetItemPathById(Id);
            StandardFields = new ItemStandardFields(Path, Database, HelperService);
        }

        public string GetDisplayName(string language = "en")
        {
            int itemVersions = HelperService.GetItemVersionsCount(Id, language, (Database)Database);
            var displayName = itemVersions == 0 ? null : HelperService.GetItemFieldValue(Id, "__Display name", language: language);
            return displayName;
        }

        public void SetDisplayName(string displayName, string language = "en", int version = 1)
        {
            HelperService.EditItemVersion(Id, language, version: version, fieldName: "__Display name", fieldValue: displayName);
        }

        public void ChangeTemplate(string templateIdOrPath)
        {
            HelperService.ChangeItemTemplate(Path, templateIdOrPath);
        }
    }
}
