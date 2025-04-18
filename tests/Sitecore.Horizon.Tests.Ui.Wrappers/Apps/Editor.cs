// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ComponentsGalleryDialog;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps
{
    public class Editor : App
    {
        private readonly JsHelper _domJsObserver;
        private readonly string canvasCssSelector = "iframe:not([hidden])";

        public Editor(BrowserWrapper browser, string clientUrl) : base("editor", browser, clientUrl)
        {
            _domJsObserver = new JsHelper(browser);
        }

        public NavigationPanel NavigationPanel => new NavigationPanel(Browser.FindElement("ng-spd-split-pane:nth-child(1)"), WaitForNewPageInCanvasLoaded);

        public LeftPanelTabs LeftPanelTabs => new LeftPanelTabs(Browser.FindElement("ng-spd-tab-group[aria-label ='Left panel tabs']"), WaitForNewPageInCanvasLoaded);

        public Rectangle LeftPanelRectangle => Browser.FindElement("app-left-hand-side").GetElementRectangle();

        public ComponentsGallery ComponentsGallery => new ComponentsGallery(Browser.FindElement("app-component-gallery"));

        public ItemsTree ContentTree => new ItemsTree(Browser.FindElement(Constants.contentTreeSelector), WaitForNewPageInCanvasLoaded);

        public PageLayout CurrentPage => GetCurrentPageInCanvas(canvasCssSelector, Browser);

        public TopPanel TopPanel => new TopPanel(Browser.FindElement("ng-spd-page-header"));

        public RightPanel RightPanel => new RightPanel(Browser.FindElement("ng-spd-page-pane"));

        public Rectangle CanvasRectangle => Browser.FindElement(canvasCssSelector).GetElementRectangle();

        public ComponentGalleryDialog ComponentGalleryDialog => new(Browser.FindElement(".cdk-overlay-container app-component-gallery-dialog"));

        public new DeviceSwitcher Device
        {
            get
            {
                Browser.SwitchToRootDocument();
                return new DeviceSwitcher(Browser);
            }
        }

        public ConfirmationDialogPanel ConfirmationDialog => new ConfirmationDialogPanel(Browser);
        protected WebElement OpenPrivewIcon => Browser.FindElement("app-horizon-workspace-header-preview-link a");

        private List<WebElement> EditorTabs => Browser.FindElements("app-left-hand-side .editor-tabs button").ToList();

        public Editor TryOpen()
        {
            base.Open();
            return this;
        }

        public new Editor Open()
        {
            base.Open();
            WaitForNewPageInCanvasLoaded();
            return this;
        }

        public Editor Open(IPageItem page, string site)
        {
            Open(page.Id, site: site);
            return this;
        }

        public Editor Open(string pageId = null, string language = null, string site = null, string device = null, bool waitForCanvas = true)
        {
            base.Open(pageId, language, site, device);
            if (waitForCanvas)
            {
                WaitForNewPageInCanvasLoaded();
            }
            return this;
        }

        public new void Reload()
        {
            base.Reload();
            WaitForNewPageInCanvasLoaded();
        }

        public void WaitForNewPageInCanvasLoaded()
        {
            WaitForNewPageInCanvas(canvasCssSelector, Browser);
            Browser.WaitForHorizonIsStable();
        }

        public void LogOut()
        {
            throw new NotImplementedException();
        }

        public void OpenPreview()
        {
            OpenPrivewIcon.Click();
            Browser.WaitForHorizonIsStable();
            Browser.WaitForCondition(b => b.TabsCount > 0);
            Browser.SwitchToNextTab();
        }

        public void OpenSiteTree()
        {
            EditorTabs.First(c => c.Text == "Site tree").Click();
        }

        public void OpenComponents()
        {
            EditorTabs.First(c => c.Text == "Components").Click();
        }
    }
}
