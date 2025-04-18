// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Layouts;
using Sitecore.Security.Accounts;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal interface ISitecoreContext
    {
        Item? Item { get; }

        DeviceItem? Device { get; }

        PageContext? Page { get; }

        User User { get; set; }

        SiteContext? Site { get; set; }

        Language Language { get; }

        Database Database { get; }

        Database? ContentDatabase { get; set; }

        HttpContextBase? HttpContext { get; }

        IHeadlessContextWrapper HeadlessContext { get; }

        object? GetData(string key);

        void SetData(string key, object? value);

        void SetDisplayMode(SiteContext site, DisplayMode mode, DisplayModeDuration duration);

        Item WorkflowStartEditing(Item item);

        Item WorkflowDuplicateItem(Item item, string newItemName);

        SiteContext SetActiveSite(string name);

        void SetLanguage(Language language, bool persistent);

        void SetLanguage(Language language, bool persistent, SiteContext site);

        public void SetDevice(DeviceItem deviceItem);

        public void EnablePreviewForUnpublishableItems(SiteContext site);
    }
}
