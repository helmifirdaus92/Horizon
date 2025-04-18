// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps
{
    public class Personalize : App
    {
        public Personalize(BrowserWrapper browser, string clientUrl) : base("personalization", browser, clientUrl)
        {
        }

        public PageLayout CurrentPage => GetCurrentPageInCanvas(Constants.CanvasCssSelector, Browser);
        public LeftHandPanel LeftHandPanel => new(Browser.RootDriver.FindElement(Constants.AppLeftHandSideLocator), WaitForNewPageInCanvasLoaded);

        public RightHandPanel RightHandPanel => new(Browser.RootDriver.FindElement(Constants.AppRightHandSideLocator));
        public TopBar TopBar => new(Browser.RootDriver.FindElement("app-top-bar"), WaitForNewPageInCanvasLoaded);
        public EditorHeader EditorHeader => new(Browser.RootDriver.FindElement("app-editor-header"), WaitForNewPageInCanvasLoaded);

        public Personalize Open(string pageId, string? site, bool waitForCanvasLoad = true, string? tenantName = null)
        {
            base.Open(pageId: pageId, site: site, tenantName: tenantName);
            if (waitForCanvasLoad)
            {
                WaitForNewPageInCanvasLoaded();
            }

            return this;
        }
    }
}
