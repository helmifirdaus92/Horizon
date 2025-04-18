// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class LeftPanelTabs
    {
        private readonly WebElement _container; //ng-spd-tab-group[aria - label = 'Left panel tabs']
        private readonly Action _canvasReloadWaitMethod;

        public LeftPanelTabs(WebElement container, Action canvasReloadWaitMethod)
        {
            _container = container;
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        private UtfWebDriver RootDriver => _container.Driver.SwitchToRootDocument();
        private ItemsTree ContentTree => new(RootDriver.FindElement(Constants.contentTreeSelector), _canvasReloadWaitMethod);
        public VersionsSection VersionsSection => new(RootDriver.FindElement("app-versions"));
        private WebElement SiteTreeButton => _container.FindElement("button.site-tab");
        private WebElement VersionsTab => _container.FindElement("button.version-tab");

        public ItemsTree OpenSiteTree()
        {
            SiteTreeButton.Click();
            _container.Driver.WaitForHorizonIsStable();
            return ContentTree;
        }

        public VersionsSection OpenVersions()
        {
            VersionsTab.Click();
            _container.Driver.WaitForHorizonIsStable();
            return VersionsSection;
        }
    }
}
