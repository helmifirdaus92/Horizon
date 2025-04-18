// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Drawing;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class NavigationPanel
    {
        private readonly string _leftPanelHeaderLocator = "app-content-tree-area h5";
        private readonly WebElement _navigationPanelElement;
        private readonly Action _canvasReloadWaitMethod;

        public NavigationPanel(WebElement navigationPanelElement, Action canvasReloadWaitMethod)
        {
            _navigationPanelElement = navigationPanelElement;
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
            navigationPanelElement.Driver.SwitchToRootDocument();
        }

        public Rectangle Rectangle => _navigationPanelElement.GetElementRectangle();
        public ItemsTree ContentTree => new(RootDriver.FindElement(Constants.contentTreeSelector), _canvasReloadWaitMethod);
        public ComponentsGallery ComponentsPanel => new(RootDriver.FindElement(Constants.pageComponentsTabSelector));
        public CreateFolderSlidingPanel CreatePageSlidingPanel => new(RootDriver.FindElement(Constants.createFolderPanelSelector));

        public bool ComponentsTabButtonEnabled => _componentsTabButton.Enabled;
        public bool ComponentsTabButtonIsActive => _componentsTabButton.GetClassList().Contains("selected");
        public string HeaderText => _navigationPanelElement.Driver.FindElement(_leftPanelHeaderLocator).Text;
        public PersonalizationPanel PersonalizationPanel => new(RootDriver.FindElement("app-left-hand-side app-personalization"));
        public bool PersonalizationTabIsSelected => PersonalizationButton.IsSelected();
        public bool AnalyzeTabIsSelected => AnalyzeButton.IsSelected();
        public bool TemplatesTabIsSelected => TemplatesButton.IsSelected();
        public bool PagesTabIsActive => EditorButton.GetClassList().Contains("selected");
        private UtfWebDriver RootDriver => _navigationPanelElement.Driver.SwitchToRootDocument();
        private WebElement EditorButton => _navigationPanelElement.FindElement("ng-spd-split-pane:nth-child(1) div:nth-of-type(1) .links");
        private WebElement ComponentsTabButton => _navigationPanelElement.FindElement("ng-spd-split-pane:nth-of-type(2) ng-spd-tab-group:nth-child(2) .links");

        private WebElement PersonalizationButton => _navigationPanelElement.FindElement("ng-spd-split-pane:nth-child(1) div:nth-of-type(3) .links");
        private WebElement TemplatesButton => _navigationPanelElement.FindElement("ng-spd-split-pane:nth-child(1) div:nth-of-type(2) .links");

        private WebElement AnalyzeButton => _navigationPanelElement.FindElement("ng-spd-split-pane:nth-child(1) div:nth-of-type(4) .links");
        private WebElement _componentsTabButton => _navigationPanelElement.FindElement(Constants.pageComponentsTabButtonSelector);


        public void OpenSitePages()
        {
            EditorButton.Click();
            _navigationPanelElement.Driver.WaitForHorizonIsStable();
        }

        public void OpenComponentsPanel()
        {
            OpenSitePages();
            ComponentsTabButton.Click();
            _navigationPanelElement.Driver.WaitForHorizonIsStable();
        }

        public void OpenTemplates()
        {
            TemplatesButton.Click();
            _navigationPanelElement.Driver.WaitForHorizonIsStable();
        }

        public void OpenPersonalizationPanel()
        {
            PersonalizationButton.Click();
            _navigationPanelElement.Driver.WaitForHorizonIsStable();
        }

        public void OpenAnalyzePanel()
        {
            AnalyzeButton.Click();
            _navigationPanelElement.Driver.WaitForHorizonIsStable();
        }
    }
}
