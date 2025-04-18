// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class VersionsPanel
    {
        private readonly WebElement _versionPanel;

        public VersionsPanel(WebElement versionsPanel)
        {
            _versionPanel = versionsPanel;
        }

        public SlidingPanelHeader SlidingPanelHeader => new(_versionPanel.FindElement("ng-spd-slide-in-panel-header"));

        public IList<VersionCard> VersionInfoCards => _content.FindElements("ng-spd-info-card")
            .Select(c => new VersionCard(c)).ToList();

        private WebElement _header => _versionPanel.FindAncestorElement("ng-spd-slide-in-panel-header");
        private WebElement _content => _versionPanel.FindElement("ng-spd-slide-in-panel-content");
        private WebElement _createNewVersion => _content.FindElement("button");

        public void SelectVersion(int version)
        {
            GetVersionCard(version).Select();
        }

        public void WaitforLoaderToDisappear()
        {
            _versionPanel.WaitForCondition(_ => !_versionPanel.CheckElementExists("ng-spd-loading-indicator"));
        }

        public ContextMenu OpenContextMenuForVersion(int version)
        {
            return GetVersionCard(version).OpenContextMenu();
        }

        public VersionCard GetVersionCard(int version)
        {
            return VersionInfoCards.First(c => c.Version == version);
        }

        public void ClickOnCreateNewVersion()
        {
            _createNewVersion.Click();
            _versionPanel.GetNextSibling().WaitForCSSAnimation();
        }

        public void GoBack()
        {
            SlidingPanelHeader.NavigateBack();
            _versionPanel.Driver.WaitForHorizonIsStable();
        }
    }
}
