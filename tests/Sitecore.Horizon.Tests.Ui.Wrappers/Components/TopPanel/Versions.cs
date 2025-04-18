// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using UTF;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;


namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class Versions
    {
        private WebElement _versions;
        public Versions(WebElement element)
        {
            _versions = element;
        }

        public VersionsSection VersionsSection => new(_versions.Driver.FindElement("app-versions"));
        private IReadOnlyCollection<WebElement> ListElements => Context.Driver.FindElements("ng-spd-popover .version-lists>button").ToList();

        public IList<VersionList> VersionListsField => _content.FindElements("button[ngSpdListItem]")
            .Select(c => new VersionList(c)).ToList();

        private WebElement _content => _versions.Driver.FindElement(".cdk-overlay-container .list-container");

        public WebElement CreateButton => _versions.Driver.FindElement(".cdk-overlay-container .footer-section button");

        public VersionActionsDialog VersionActionsDialog => new(_versions.Driver.FindElement(".cdk-overlay-container"));

        public void WaitforLoaderToDisappear()
        {
            _versions.WaitForCondition(_ => !_versions.CheckElementExists("ng-spd-loading-indicator"));
        }

        public List<string> GetAvailableVersionsInList()
        {
            return ListElements.Select(el => el.Text).ToList();
        }
        public void SelectVersion(int version)
        {
            GetVersionList(version).Select();
        }
        public VersionList GetVersionList(int version)
        {
            return VersionListsField.First(c => c.Version == version);
        }
        public ContextMenu OpenContextMenuForVersion(int version)
        {
           return GetVersionList(version).OpenContextMenu();
        }
    }
}

