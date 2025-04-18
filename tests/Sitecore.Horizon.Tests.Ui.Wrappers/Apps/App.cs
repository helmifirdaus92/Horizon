// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Specialized;
using System.Linq;
using System.Threading;
using System.Web;
using OpenQA.Selenium;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Item;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageLayout;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TimedNotification;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps
{
    public abstract class App
    {
        //every time when we reload canvas we write this custom property
        private const string FrameCustomPropertyName = "uiTestsPageCustomProperty";
        protected readonly BrowserWrapper Browser;

        protected App(string appPath, BrowserWrapper browser, string clientUrl)
        {
            AppRelativePath = appPath;
            Browser = browser;
            ClientUrl = clientUrl;
        }

        public DeviceSwitcher Device => new DeviceSwitcher(Browser);

        public string PageUrl => Browser.PageUrl.Remove(0, AppRelativePath.Length + 1);

        public TimedNotification TimedNotification
        {
            get
            {
                WebElement element = null;
                Browser.WaitForCondition(b => (element = b.CheckElement("ng-spd-timed-notification-item", 20000)) != null);
                return new TimedNotification(element);
            }
        }

        public WarningDialog WarningDialog
        {
            get
            {
                return new WarningDialog(Browser.FindElement("app-warning-dialog"));
            }
        }

        public NameValueCollection UrlQueryStrings => HttpUtility.ParseQueryString(new Uri(Browser.PageUrl).Query);
        protected WebElement CanvasReloadButton => Browser.FindElement("app-reload-canvas-button");

        protected string ClientUrl { get; set; }
        protected string AppRelativePath { get; set; }

        public void WaitForNotificationToDisappear()

        {
            bool elementExists = Browser.CheckElementExists("ng-spd-timed-notification-item");
            if (elementExists)
            {
                Browser.WaitForCondition(b => !b.CheckElementExists("ng-spd-timed-notification-item"), 5000);
            }
        }

        public virtual void Open()
        {
            Browser.Navigate($"{ClientUrl}/{AppRelativePath}");
            Browser.WaitForCondition(d => UrlQueryStrings.AllKeys.Contains("organization") && UrlQueryStrings["organization"].Equals("org_FzUOtp4HjfZYw1Hv"), message: $"Url after wait condition : {Browser.PageUrl}");
        }

        public void Open(string pageId = null, string language = null, string site = null, string device = null, string version = null)
        {
            var url = "";
            if (pageId != null || language != null || site != null || device != null)
            {
                url += "?";
            }

            url += pageId == null ? "" : $"sc_itemid={pageId}&";
            url += language == null ? "" : $"sc_lang={language}&";
            url += site == null ? "" : $"sc_site={site}&";
            url += device == null ? "" : $"sc_device={device}&";
            url += version == null ? "" : $"sc_version={version}&";
            NavigateTo(url);
        }

        public void Reload()
        {
            Browser.Refresh();
        }

        public virtual void NavigateTo(string url)
        {
            string relativePath;
            if ((url.StartsWith("?") || url.StartsWith(";")) && AppRelativePath.EndsWith("/"))
            {
                relativePath = AppRelativePath.Substring(0, AppRelativePath.Length - 1);
            }
            else
            {
                relativePath = AppRelativePath;
            }

            Browser.Navigate($"{ClientUrl}/{relativePath}{url}");
        }

        public bool UrlContainsRequiredParams(IGenericItem page, string language = "en", string site = "website", int version = 1, string tenantName = "local-xm-cloud-instance", string orgId = "org_FzUOtp4HjfZYw1Hv")
        {
            string url = Browser.PageUrl;
            Logger.WriteLineWithTimestamp("Page URL is: " + url);
            var queryStrings = HttpUtility.ParseQueryString(new Uri(url).Query);
            bool queryStringParamsCountIsCorrect = queryStrings.Count == 5;
            Logger.WriteLineWithTimestamp($"Page URL contains {queryStrings.Count} query string parameters: '{0}' ", queryStringParamsCountIsCorrect);
            bool pageUrlContainsPageId = queryStrings["sc_itemid"].Equals(page.ShortId, StringComparison.OrdinalIgnoreCase);
            Logger.WriteLineWithTimestamp("Page URL contains page id: '{0}'", pageUrlContainsPageId);
            bool pageUrlContainsLang = queryStrings["sc_lang"].Equals(language, StringComparison.OrdinalIgnoreCase);
            Logger.WriteLineWithTimestamp("Page URL contains lang: '{0}'", pageUrlContainsLang);
            bool pageUrlContainsSite = queryStrings["sc_site"].Equals(site, StringComparison.OrdinalIgnoreCase);
            Logger.WriteLineWithTimestamp("Page URL contains site: '{0}'", pageUrlContainsSite);
            bool pageUrlContainsVersion = queryStrings["sc_version"].Equals(version.ToString(), StringComparison.OrdinalIgnoreCase);
            Logger.WriteLineWithTimestamp("Page URL contains version: '{0}'", pageUrlContainsVersion);
            bool pageUrlOrganization = queryStrings["organization"].Equals(orgId, StringComparison.OrdinalIgnoreCase);
            Logger.WriteLineWithTimestamp("Page URL contains organization: '{0}'", pageUrlOrganization);

            return pageUrlContainsPageId && pageUrlContainsLang && pageUrlContainsSite
                && queryStringParamsCountIsCorrect && pageUrlContainsVersion && pageUrlOrganization;
        }

        public bool IsPageInCanvasReloaded(PageLayout canvas)
        {
            return (bool)canvas.ExecuteJavaScript($"return window['{FrameCustomPropertyName}'] == undefined");
        }

        protected PageLayout GetCurrentPageInCanvas(string frameSccSelector, BrowserWrapper browser)
        {
            var page = new PageLayout(frameSccSelector, browser);
            return page;
        }

        protected PageLayout WaitForNewPageInCanvas(string frameSccSelector, BrowserWrapper browser)
        {
            //wait until old page disappears
            this.WaitForCondition(c =>
            {
                try
                {
                    var page = new PageLayout(frameSccSelector, browser);
                    if (page.GetText().Contains("/api/editing/render failed"))
                    {
                        Logger.WriteLineWithTimestamp("RenderingHost failed to load page content, reloading canvas...");
                        Logger.WriteLineWithTimestamp("Error message in full: " +page.GetText());
                        CanvasReloadButton.Click();
                        Thread.Sleep(1000);
                        page = new PageLayout(frameSccSelector, browser);
                    }
                    return IsPageInCanvasReloaded(page);
                }
                catch (Exception e)
                {
                    Logger.WriteLineWithTimestamp("Failed to initialize frame page. Going to try in 0.5s. Exception: " + e);
                    Thread.Sleep(500);
                    return false;
                }
            }, Context.Settings.WaitTimeout, 300);

            //get new
            var newPage = GetCurrentPageInCanvas(frameSccSelector, browser);
            newPage.ExecuteJavaScript($"window['{FrameCustomPropertyName}'] = 'ABC'");
            Thread.Sleep(300); //Wait for angular
            return newPage;
        }
    }
}
