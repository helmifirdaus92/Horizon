// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Data;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Items
{
    internal enum ItemScope
    {
        AnyNonSystem = 0,
        ContentOnly,
        LayoutOnly,
        MediaOnly,
        AllRootsItem
    }

    internal interface IHorizonItemHelper
    {
        DeviceItem DefaultDevice { get; init; }

        bool IsHorizonItem(Item item);

        bool HasPresentation(Item item);

        bool IsMediaItem(Item item);

        bool IsMediaFolder(Item item);

        bool IsFolder(Item item);

        bool IsPresentationFolder(Item item);

        bool IsBranchTemplateWithPresentation(TemplateItem branchItem);

        bool IsTemplateWithPresentation(TemplateItem templateItem);

        bool IsFolderTemplate(TemplateItem templateItem);

        IReadOnlyCollection<TemplateItem> GetInsertOptions(Item item);

        void DeleteItem(Item item);

        void DeleteItemVersion(Item itemVersion);

        Item? GetItem(ID id, ItemScope scope = ItemScope.ContentOnly);

        Item? GetItem(string path, ItemScope scope = ItemScope.ContentOnly);

        Item? GetItem(ID id, Version version, ItemScope scope = ItemScope.ContentOnly);

        Item? GetItem(string path, Version version, ItemScope scope = ItemScope.ContentOnly, Globalization.Language? language = null);

        ID? GetBranchTemplateId(TemplateItem branchItem);

        string GenerateLinkWithoutLanguage(Item item);

        string GenerateItemRoute(Item item);

        Item AddItemVersion(Item item, string versionName);

        Item SetItemVersionName(Item itemVersion, string versionName);

        bool IsFeaasRendering(Item item);

        bool IsByocRendering(Item item);
    }
}
