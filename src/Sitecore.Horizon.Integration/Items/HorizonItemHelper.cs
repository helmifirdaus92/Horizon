// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Data.Masters;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Links;
using Sitecore.Links.UrlBuilders;
using Sitecore.Web;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.Items
{
    internal class HorizonItemHelper : IHorizonItemHelper
    {
        public static readonly ID RenderingFolder = new ID("{7EE0975B-0698-493E-B3A2-0B2EF33D0522}");
        public static readonly ID FEaaSRendering = new ID("{CAA0C742-F052-49FB-825B-A03494798DB7}");
        public static readonly ID BYOCRendering = new ID("{DDC43BE7-D77A-4CE3-9282-03DD036EEC6D}");
        public static readonly ID SublayoutFolder = new ID("{3BAA73E5-6BA9-4462-BF72-C106F8801B11}");
        public static readonly ID DefaultDeviceId = new ID("{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}");
        public static readonly ID SxaPresentationFolderId = new ID("{0A70FA73-8923-4A6E-ABF3-4134F25F3221}");
        public static readonly ID UnversionedDocumentTemplateId = new ID("{777F0C76-D712-46EA-9F40-371ACDA18A1C}");
        public static readonly ID VersionedDocumentTemplateId = new ID("{2A130D0C-A2A9-4443-B418-917F857BF6C9}");

        private readonly BaseTemplateManager _templateManager;
        private readonly BaseSettings _settings;
        private readonly ISitecoreContext _context;
        private readonly BaseLinkManager _linkManager;
        private readonly BaseItemManager _baseItemManager;

        public HorizonItemHelper(BaseTemplateManager templateManager,
            BaseSettings settings,
            ISitecoreContext context,
            BaseLinkManager linkManager,
            BaseItemManager baseItemManager)
        {
            Assert.ArgumentNotNull(templateManager, nameof(templateManager));
            Assert.ArgumentNotNull(settings, nameof(settings));
            Assert.ArgumentNotNull(context, nameof(context));
            Assert.ArgumentNotNull(linkManager, nameof(linkManager));
            Assert.ArgumentNotNull(baseItemManager, nameof(baseItemManager));

            _templateManager = templateManager;
            _settings = settings;
            _context = context;
            _linkManager = linkManager;
            _baseItemManager = baseItemManager;

            DefaultDevice = _context.Database.GetItem(DefaultDeviceId);
        }

        public DeviceItem DefaultDevice { get; init; }

        public bool IsHorizonItem(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            return (IsFolder(item) || HasPresentation(item)) && !IsSxaPresentationFolder(item);
        }

        public bool IsMediaItem(Item item)
        {
            if (!item.Paths.IsMediaItem)
            {
                return false;
            }

            var template = _templateManager.GetTemplate(item);
            return IsMediaTemplateId(template.ID) || template.GetBaseTemplates().Any(t => IsMediaTemplateId(t.ID));

            bool IsMediaTemplateId(ID tid)
            {
                return tid == TemplateIDs.VersionedImage || tid == TemplateIDs.UnversionedImage || tid == UnversionedDocumentTemplateId || tid == VersionedDocumentTemplateId;
            }
        }

        public bool IsMediaFolder(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            if (item.TemplateID == TemplateIDs.MediaFolder || item.ID == ItemIDs.MediaLibraryRoot)
            {
                return true;
            }

            var template = _templateManager.GetTemplate(item);
            return template != null && template.InheritsFrom(TemplateIDs.MediaFolder);
        }

        public bool IsFolder(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            if (item.TemplateID == TemplateIDs.Folder)
            {
                return true;
            }

            var template = _templateManager.GetTemplate(item);
            return template != null && template.InheritsFrom(TemplateIDs.Folder);
        }

        public bool IsPresentationFolder(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            return item.TemplateID == TemplateIDs.Folder || item.TemplateID == RenderingFolder ||
                item.TemplateID == SublayoutFolder || item.TemplateID == TemplateIDs.Node;
        }

        public bool IsBranchTemplateWithPresentation(TemplateItem branchItem)
        {
            Assert.ArgumentNotNull(branchItem, nameof(branchItem));

            if (branchItem.InnerItem.TemplateID != TemplateIDs.BranchTemplate || branchItem.InnerItem.Children.Count <= 0)
            {
                return false;
            }

            Item branchTemplateItem = branchItem.InnerItem.Children[0];
            return branchTemplateItem != null && HasPresentation(branchTemplateItem);
        }

        public bool HasPresentation(Item item)
        {
            Assert.ArgumentNotNull(item, nameof(item));

            return item.Visualization.GetLayout(_context.Device) != null;
        }

        public bool IsTemplateWithPresentation(TemplateItem templateItem)
        {
            Assert.ArgumentNotNull(templateItem, nameof(templateItem));

            if (templateItem.InnerItem.TemplateID != TemplateIDs.Template)
            {
                return false;
            }

            var standardValues = templateItem.StandardValues;
            if (standardValues != null && HasPresentation(standardValues))
            {
                return true;
            }

            var baseTemplateList = _templateManager.GetTemplate(templateItem.ID, templateItem.Database).GetBaseTemplates();

            return baseTemplateList.Where(baseTemp => baseTemp.StandardValueHolderId is not null)
                .Select(baseTemplate => templateItem.Database.GetItem(baseTemplate.StandardValueHolderId))
                .Any(HasPresentation);
        }

        public bool IsFolderTemplate(TemplateItem templateItem)
        {
            Assert.ArgumentNotNull(templateItem, nameof(templateItem));

            var template = _templateManager.GetTemplate(templateItem.ID, templateItem.Database);
            return template != null && template.InheritsFrom(TemplateIDs.Folder);
        }

        public bool IsSxaPresentationFolder(Item item)
        {
            return item.TemplateID == SxaPresentationFolderId;
        }

        public IReadOnlyCollection<TemplateItem> GetInsertOptions(Item item)
        {
            return Masters.GetMasters(item).Select(i => new TemplateItem(i)).ToArray();
        }

        public void DeleteItem(Item item)
        {
            if (_settings.Core().RecycleBinActive)
            {
                item.Recycle();
            }
            else
            {
                item.Delete();
            }
        }

        public void DeleteItemVersion(Item item)
        {
            if (_settings.Core().RecycleBinActive)
            {
                item.RecycleVersion();
            }
            else
            {
                item.Versions.RemoveVersion();
            }
        }

        public Item? GetItem(ID id, ItemScope scope)
        {
            return FilterItemByScope(_context.Database.GetItem(id), scope);
        }

        public Item? GetItem(string path, ItemScope scope)
        {
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }

            return FilterItemByScope(_context.Database.GetItem(path), scope);
        }

        public Item? GetItem(ID id, Version version, ItemScope scope)
        {
            return FilterItemByScope(_context.Database.GetItem(id, _context.Language, version), scope);
        }

        public Item? GetItem(string path, Version version, ItemScope scope, Globalization.Language? language = null)
        {
            if (string.IsNullOrEmpty(path))
            {
                return null;
            }

            if (language == null)
            {
                language = _context.Language;
            }

            return FilterItemByScope(_context.Database.GetItem(path, language, version), scope);
        }

        public ID? GetBranchTemplateId(TemplateItem branchItem)
        {
            Assert.ArgumentNotNull(branchItem, nameof(branchItem));

            if (branchItem.InnerItem.TemplateID != TemplateIDs.BranchTemplate || branchItem.InnerItem.Children.Count <= 0)
            {
                return null;
            }

            return branchItem.InnerItem.Children[0].TemplateID;
        }

        public string GenerateLinkWithoutLanguage(Item item)
        {
            return _linkManager.GetItemUrl(item, new ItemUrlBuilderOptions
            {
                LanguageEmbedding = LanguageEmbedding.Never,
            });
        }

        public Item AddItemVersion(Item item, string versionName)
        {
            return SetItemVersionName(_baseItemManager.AddVersion(item), versionName);
        }

        public Item SetItemVersionName(Item itemVersion, string versionName)
        {
            using (new EditContext(itemVersion))
            {
                itemVersion.Fields[FieldIDs.VersionName]?.SetValue(versionName, true);
            }

            return itemVersion;
        }

        private Item? FilterItemByScope(Item? item, ItemScope scope)
        {
            if (item == null)
            {
                return null;
            }

            var matchesScope = scope switch
            {
                ItemScope.ContentOnly => item.ID == ItemIDs.ContentRoot || ExtendContentItemScope(item) || item.Paths.IsContentItem,
                ItemScope.LayoutOnly => item.ID == ItemIDs.LayoutRoot || item.Paths.FullPath.StartsWith("/sitecore/layout/", StringComparison.OrdinalIgnoreCase),
                ItemScope.MediaOnly => item.ID == ItemIDs.MediaLibraryRoot || item.Paths.FullPath.StartsWith("/sitecore/media library/", StringComparison.OrdinalIgnoreCase),
                ItemScope.AnyNonSystem => item.ID != ItemIDs.SystemRoot && !item.Paths.FullPath.StartsWith("/sitecore/system/", StringComparison.OrdinalIgnoreCase),
                ItemScope.AllRootsItem => true,
                _ => false
            };

            return matchesScope ? item : null;
        }

        private bool ExtendContentItemScope(Item item)
        {
            var getContentScopePaths = _settings.GetSetting("Horizon.ExtraContentScopePaths");
            var paths = getContentScopePaths.Split('|');

            return paths.Any(path => item.Paths.FullPath.StartsWith(path, StringComparison.OrdinalIgnoreCase));
        }

        public string GenerateItemRoute(Item item)
        {
            var options = _linkManager.GetDefaultUrlBuilderOptions();
            options.LanguageEmbedding = LanguageEmbedding.Never;
            options.AlwaysIncludeServerUrl = false;
            options.AlwaysExcludeVirtualFolder = true;
            options.SiteResolving = true;

            var url = _linkManager.GetItemUrl(item, options);
            return WebUtil.GetLocalPath(url);
        }

        public bool IsFeaasRendering(Item item)
        {
            return item.ID == FEaaSRendering;
        }

        public bool IsByocRendering(Item item)
        {
            return item.ID == BYOCRendering;
        }

    }
}
