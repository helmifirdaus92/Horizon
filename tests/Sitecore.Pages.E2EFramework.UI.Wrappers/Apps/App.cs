// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Specialized;
using System.Web;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps
{
    public abstract class App
    {
        private const string CanvasCssSelector = "iframe.editor";
        private const string FrameCustomPropertyName = "uiTestsPageCustomProperty";
        private const string SitecoreHorizonCanvasAppReadyFlag = "Sitecore.Horizon.Canvas.AppReady";
        protected readonly BrowserWrapper Browser;

        protected App(string appPath, BrowserWrapper browser, string clientUrl)
        {
            AppRelativePath = appPath;
            Browser = browser;
            ClientUrl = clientUrl;
        }

        public TimedNotification TimedNotification
        {
            get
            {
                Browser.SwitchToDefaultContent();
                Browser.WaitForCondition(b => b.CheckElementExists("ng-spd-timed-notification-item"), TimeSpan.FromSeconds(20), 500);
                return new TimedNotification(Browser.FindElement("ng-spd-timed-notification-item"));
            }
        }

        public TimedNotification PublishingTimedNotification
        {
            get
            {
                Browser.SwitchToDefaultContent();
                Browser.WaitForCondition(b => b.CheckElementExists("ng-spd-timed-notification-item"), TimeSpan.FromSeconds(300), 500);
                return new TimedNotification(Browser.FindElement("ng-spd-timed-notification-item"));
            }
        }

        public TimedNotification TestEndedTimedNotification
        {
            get
            {
                Browser.SwitchToDefaultContent();
                Browser.WaitForCondition(b => b.CheckElementExists("ng-spd-timed-notification-item.endTestSuccess"), TimeSpan.FromSeconds(300), 500);
                return new TimedNotification(Browser.FindElement("ng-spd-timed-notification-item.endTestSuccess"));
            }
        }

        public ConfirmationDialog ConfirmationDialog => new(Browser.FindElement("app-warning-dialog"));

        public NameValueCollection UrlQueryStrings => HttpUtility.ParseQueryString(new Uri(Browser.PageUrl).Query);
        protected IWebElement CanvasReloadButton => Browser.RootDriver.FindElement("app-reload-canvas-button");

        protected string ClientUrl { get; set; }
        protected string AppRelativePath { get; set; }

        public bool TimedNotificationExists()
        {
            return Browser.CheckElementExists("ng-spd-timed-notification-item");
        }

        public void WaitForNotificationToDisappear()

        {
            bool elementExists = Browser.CheckElementExists("ng-spd-timed-notification-item");
            if (elementExists)
            {
                Browser.WaitForCondition(b => !b.CheckElementExists("ng-spd-timed-notification-item"), TimeSpan.FromMilliseconds(5500), 500);
            }
        }

        public virtual void Open()
        {
            Browser.GoToUrl(new Uri($"{ClientUrl}/{AppRelativePath}"));
            Browser.WaitForCondition(d => Browser.PageUrl.Contains("organization="));
        }

        public void WaitForNewPageInCanvasLoaded()
        {
            WaitForNewPageInCanvas(CanvasCssSelector, Browser);
            Browser.RootDriver.WaitForHorizonIsStable();
        }

        public bool IsPageInCanvasReloaded(PageLayout canvas)
        {
            return (bool)canvas.ExecuteJavaScript($"return window['{FrameCustomPropertyName}'] == undefined && window['{SitecoreHorizonCanvasAppReadyFlag}'] == true");
        }

        public virtual void Open(string? pageId = null, string? language = null, string? site = null, string? device = null, string? version = null, string? tenantName = null)
        {
            var url = "";
            if (pageId != null || language != null || site != null || device != null)
            {
                url += "?";
            }

            url += tenantName == null ? "" : $"tenantName={tenantName}&";
            url += pageId == null ? "" : $"sc_itemid={pageId}&";
            url += language == null ? "" : $"sc_lang={language}&";
            url += site == null ? "" : $"sc_site={site}&";
            url += device == null ? "" : $"sc_device={device}&";
            url += version == null ? "" : $"sc_version={version}&";
            Browser.GoToUrl(new Uri($"{ClientUrl}/{AppRelativePath}{url}"));
            Browser.WaitForCondition(d => Browser.PageUrl.Contains("organization="));
        }

        protected static PageLayout GetCurrentPageInCanvas(string frameSccSelector, BrowserWrapper browser)
        {
            var page = new PageLayout(frameSccSelector, browser.GetDriver());
            return page;
        }

        private PageLayout WaitForNewPageInCanvas(string frameSccSelector, BrowserWrapper browser)
        {
            //wait until old page disappears
            this.WaitForCondition(c =>
            {
                try
                {
                    var page = new PageLayout(frameSccSelector, browser.GetDriver());
                    page.WaitForCondition(p => !string.IsNullOrEmpty(p.GetText()), TimeSpan.FromMilliseconds(500), 100, message: "iframe is empty... retrying in 0.1s");
                    if (page.GetText().Contains("/api/editing/render failed") || page.GetText().Contains("Page not found"))
                    {
                        Logger.Write("RenderingHost failed to load or Page is not found, reloading canvas...");
                        Logger.Write("Error message in full: " + page.GetText());
                        CanvasReloadButton.Click();
                        Thread.Sleep(1000);
                        page = new PageLayout(frameSccSelector, browser.GetDriver());
                    }

                    return IsPageInCanvasReloaded(page);
                }
                catch (Exception e)
                {
                    Logger.Write("Failed to initialize frame page. Going to try in 0.5s. Exception: " + e);
                    Thread.Sleep(500);
                    return false;
                }
            }, Settings.LongWaitTimeout, 300);

            // wait until only one iframe is present on the page
            if (browser.RootDriver.FindElements(frameSccSelector).Count>1)
            {
                Logger.Write("There are more than one iframes on the page. Waiting for the old one to be removed.");
                browser.RootDriver.WaitForCondition(b => b.FindElements(frameSccSelector).Count == 1, TimeSpan.FromSeconds(2), 500);
            }

            //get new
            var newPage = GetCurrentPageInCanvas(frameSccSelector, browser);
            newPage.ExecuteJavaScript($"window['{FrameCustomPropertyName}'] = 'ABC'");
            Logger.Write("Page loaded at : " + DateTime.Now);
            Thread.Sleep(300); //Wait for angular
            return newPage;
        }
    }
}
