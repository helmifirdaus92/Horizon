// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Apps.Templates;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers
{
    public class Horizon
    {
        private Editor _editor;
        private Preview _preview;
        private PageTemplates _pageTemplates;
        private PageDesigns _pageDesigns;
        private PartialDesigns _partialDesigns;
        private PartialDesignEditor _partialDesignEditor;
        private PageDesignEditor _pageDesignEditor;

        public Horizon(BrowserWrapper browser, string backendUrl, string clientUrl)
        {
            Browser = browser;
            ClientUrl = clientUrl;
            BackendUrl = backendUrl;
        }

        public BrowserWrapper Browser { get; }
        public string ClientUrl { get; }

        public Editor Editor
        {
            get
            {
                _editor = _editor ?? new Editor(Browser, ClientUrl);
                return _editor;
            }
        }

        public Preview Preview
        {
            get
            {
                _preview = _preview ?? new Preview(Browser, BackendUrl);
                return _preview;
            }
        }

        public PageTemplates PageTemplates
        {
            get
            {
                _pageTemplates = _pageTemplates ?? new PageTemplates(Browser, ClientUrl);
                return _pageTemplates;
            }
        }

        public PageDesigns PageDesigns
        {
            get
            {
                _pageDesigns = _pageDesigns ?? new PageDesigns(Browser, ClientUrl);
                return _pageDesigns;
            }
        }

        public PartialDesigns PartialDesigns
        {
            get
            {
                _partialDesigns = _partialDesigns ?? new PartialDesigns(Browser, ClientUrl);
                return _partialDesigns;
            }
        }

        public PartialDesignEditor PartialDesignEditor
        {
            get
            {
                _partialDesignEditor = new PartialDesignEditor(Browser, ClientUrl);
                return _partialDesignEditor;
            }
        }

        public PageDesignEditor PageDesignEditor
        {
            get
            {
                _pageDesignEditor = new PageDesignEditor(Browser, ClientUrl);
                return _pageDesignEditor;
            }
        }
        private string _backendShellUrl => $"{BackendUrl}/sitecore/shell";
        private string _identityServerUrlPostfix => $"/u/login/identifier";

        private string BackendUrl { get; }

        public void Terminate()
        {
            Browser.Quit();
        }

        public void TerminateSoft()
        {
            Browser.QuitSoft();
        }

        public Horizon Login(string username, string password)
        {
            LoginToUrl(ClientUrl, username, password);
            Browser.WaitForDocumentLoaded();
            return this;
        }

        public Horizon ReloginWithDifferentUser(string newUserName, string password)
        {
            Logout();
            LoginToUrl(_backendShellUrl, newUserName, password);
            Editor.Open();
            return this;
        }

        public Horizon ReloginWithDifferentUserAndTryOpenEditor(string newUserName, string password)
        {
            Logout();
            LoginToUrl(_backendShellUrl, newUserName, password);
            Editor.TryOpen();
            Browser.WaitForHorizonIsStable();
            return this;
        }

        public void Logout()
        {
            Browser.Navigate(_backendShellUrl);
            Browser.FindElement(".sc-globalHeader-loginInfo .logout").Click();
            this.WaitForCondition(c => Browser.PageUrl.Contains(_identityServerUrlPostfix));
            Browser.WaitForDocumentLoaded();
        }

        public Editor OpenHorizonFromBackend(string username, string password, string hostUrl = null)
        {
            Logout();
            hostUrl = hostUrl ?? BackendUrl;
            LoginToUrl($"{hostUrl}/sitecore/client/Applications/Launchpad", username, password);
            new LaunchPad().Shortcuts["Horizon"].Click();
            try
            {
                Editor.WaitForNewPageInCanvasLoaded();
            }
            catch
            {
                Logger.WriteLineWithTimestamp($"Failed to switch to window {ClientUrl}");
                throw;
            }

            return Editor;
        }

        public Horizon LogInToBackend(string username, string password)
        {
            LoginToUrl(_backendShellUrl, username, password);
            return this;
        }

        public void InvokeLoginPage()
        {
            Browser.Navigate(_backendShellUrl);
            _ = new LoginPage();
        }

        public void ClearBrowserCache(bool clearCookies = false)
        {
            Browser.Navigate("chrome://settings/clearBrowserData");

            Browser.SwitchToRootDocument();

            string selector = "settings-ui/deep/";

            //Browser.ExecuteJavaScript<>()FindElement("cr-dialog").Driver.ExecuteJavaScript("return arguments[0].shadowRoot");
            string confirmButtonCss = $"{selector}#clearBrowsingDataConfirm";
            Browser.WaitForCondition(b => b.CheckElementExists(confirmButtonCss));

            string cookiesSettingScc = $"{selector}#cookiesCheckboxBasic";
            if (Browser.FindElement(cookiesSettingScc).HasAttribute("checked") != clearCookies)
            {
                Browser.FindElement($"{cookiesSettingScc}/deep/#checkbox").Click();
            }

            string cacheSettingScc = $"{selector}#cacheCheckboxBasic";
            if (!Browser.FindElement(cacheSettingScc).HasAttribute("checked"))
            {
                Browser.FindElement($"{cacheSettingScc}/deep/#checkbox").Click();
            }

            Browser.FindElement(confirmButtonCss).Click();
            Browser.WaitForCondition(b => !b.CheckElementExists(confirmButtonCss));
        }

        public void ClearCookies()
        {
            Context.Browser.ClearCookies();
        }

        private void LoginToUrl(string url, string username, string password)
        {
            Browser.Navigate(url);
            try
            {
                new LoginPage().LoginToLaunchPad(username, password);
            }
            catch
            {
                Browser.Navigate(url);
                new LoginPage().LoginToLaunchPad(username, password);
            }

            // wait for desktop to load
            Browser.WaitForCondition(b => b.FindElement(".sc-applicationHeader-title").Text.Equals("XM Cloud"));
        }
    }
}
