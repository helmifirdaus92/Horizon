// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Web;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Globalization;
using Sitecore.Layouts;
using Sitecore.Security.Accounts;
using Sitecore.Sites;

namespace Sitecore.Horizon.Integration.ExternalProxy
{
    internal class SitecoreContextWrapper : ISitecoreContext
    {
        private readonly BaseAuthenticationManager _authenticationManager;
        private readonly BaseFactory _factory;

        public SitecoreContextWrapper(BaseAuthenticationManager authenticationManager, BaseFactory factory, IHeadlessContextWrapper headlessContextWrapper)
        {
            _authenticationManager = authenticationManager ?? throw new ArgumentNullException(nameof(authenticationManager));
            _factory = factory ?? throw new ArgumentNullException(nameof(factory));
            HeadlessContext = headlessContextWrapper ?? throw new ArgumentNullException(nameof(headlessContextWrapper));
        }

        public Item? Item => Sitecore.Context.Item;

        public DeviceItem? Device => Sitecore.Context.Device;

        public PageContext? Page => Sitecore.Context.Page;

        public User User
        {
            get => Sitecore.Context.User;
            set
            {
                Assert.ArgumentNotNull(value, nameof(value));
                _authenticationManager.SetActiveUser(value);
            }
        }

        public SiteContext? Site
        {
            get => Sitecore.Context.Site;
            set
            {
                // While the property can be null, we don't expect us to write null value to context.
                Assert.ArgumentNotNull(value, nameof(value));
                Sitecore.Context.Site = value;
            }
        }

        public Language Language => Sitecore.Context.Language;

        public Database Database => Sitecore.Context.Database;

        public Database? ContentDatabase
        {
            get => Sitecore.Context.ContentDatabase;
            set => Sitecore.Context.ContentDatabase = value;
        }

        public HttpContextBase? HttpContext => Sitecore.Context.HttpContext;

        public IHeadlessContextWrapper HeadlessContext { get; }

        public object GetData(string key) => Sitecore.Context.Items[key];

        public void SetData(string key, object? value) => Sitecore.Context.Items[key] = value;

        public void SetDisplayMode(SiteContext site, DisplayMode mode, DisplayModeDuration duration)
        {
            Assert.ArgumentNotNull(site, nameof(site));

            site.SetDisplayMode(mode, duration);
        }

        public Item WorkflowStartEditing(Item item)
        {
            return Sitecore.Context.Workflow.StartEditing(item);
        }

        public Item WorkflowDuplicateItem(Item item, string newItemName)
        {
            return Sitecore.Context.Workflow.DuplicateItem(item, newItemName);
        }

        public SiteContext SetActiveSite(string name)
        {
            if (!name.Equals(Site?.Name, StringComparison.OrdinalIgnoreCase))
            {
                Sitecore.Context.SetActiveSite(name);
            }

            return Site!;
        }

        public void SetLanguage(Language language, bool persistent)
        {
            Sitecore.Context.SetLanguage(language, persistent);
        }

        public void SetLanguage(Language language, bool persistent, SiteContext site)
        {
            Sitecore.Context.SetLanguage(language, persistent, site);
        }

        public void SetDevice(DeviceItem deviceItem)
        {
            Sitecore.Context.Device = deviceItem;
        }

        public void EnablePreviewForUnpublishableItems(SiteContext site)
        {
            site.PreviewUnpublishableItems = true;
        }
    }
}
