// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Apps.Templates;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages
{
    public class Pages : BasePage
    {
        private Editor? _editor;
        private PageDesigns? _pageDesigns;
        private PartialDesigns? _partialDesigns;
        private PageTemplates? _pageTemplates;
        private BrowserWrapper? Browser;
        private EditPartialDesign? _editPartialDesign;
        private EditPageDesign? _editPageDesign;
        private Personalize? _personalize;
        private Analytics? _analytics;
        private Preview? _preview;

        public Pages(IWebDriver driver, string clientUrl) : base(driver)
        {
            Browser = new BrowserWrapper(driver);
            ClientUrl = clientUrl;
        }

        private enum Apps
        {
            Pages,
            Components,
            Personalize,
            Templates,
            Analyze
        }

        public string ClientUrl { get; }
        public TopBar TopBar => new(RootDriver.FindElement("app-top-bar"));
        public NoOrgError NoOrgError => new(RootDriver.FindElement("app-no-organization"));

        public Editor? Editor
        {
            get
            {
                if (Browser != null)
                {
                    _editor ??= new Editor(Browser, ClientUrl);
                }

                return _editor;
            }
        }

        public Personalize? Personalize
        {
            get
            {
                if (Browser != null)
                {
                    _personalize ??= new Personalize(Browser, ClientUrl);
                }

                return _personalize;
            }
        }

        public Analytics? Analytics
        {
            get
            {
                if (Browser != null)
                {
                    _analytics ??= new Analytics(Browser, ClientUrl);
                }

                return _analytics;
            }
        }

        public PageDesigns? PageDesigns
        {
            get
            {
                if (Browser != null)
                {
                    _pageDesigns ??= new PageDesigns(Browser, ClientUrl);
                }

                return _pageDesigns;
            }
        }

        public PartialDesigns? PartialDesigns
        {
            get
            {
                if (Browser != null)
                {
                    _partialDesigns ??= new PartialDesigns(Browser, ClientUrl);
                }

                return _partialDesigns;
            }
        }

        public PageTemplates? PageTemplates
        {
            get
            {
                if (Browser != null)
                {
                    _pageTemplates ??= new PageTemplates(Browser, ClientUrl);
                }

                return _pageTemplates;
            }
        }

        public EditPartialDesign? EditPartialDesign
        {
            get
            {
                if (Browser != null)
                {
                    _editPartialDesign ??= new EditPartialDesign(Browser, ClientUrl);
                }

                return _editPartialDesign;
            }
        }

        public EditPageDesign? EditPageDesign
        {
            get
            {
                if (Browser != null)
                {
                    _editPageDesign ??= new EditPageDesign(Browser, ClientUrl);
                }

                return _editPageDesign;
            }
        }

        public Preview? Preview
        {
            get
            {
                if (Browser != null)
                {
                    _preview ??= new Preview(Browser, ClientUrl);
                }

                return _preview;
            }
        }

        private IWebElement _noTenantAccessLogOutLink => RootDriver.FindElement("ng-spd-empty-state app-logout-link");

        private IWebDriver? RootDriver => Browser?.GetDriver().SwitchTo().DefaultContent();

        public void LogOutAtNoTenantAccess()
        {
            _noTenantAccessLogOutLink.Click();
        }

        public void Logout()
        {
            if (Browser == null)
            {
                return;
            }

            Browser.GoToUrl(new(ClientUrl + "/logout"));
            Browser.WaitForCondition(b => b.PageUrl.StartsWith("https://auth-staging-1.sitecore-staging.cloud/"));
        }

        public NamedCollection<T> GetNamedControls<T>(string cssSelector) where T : BaseControl, INamedObject
        {
            return RootDriver.FindNamedControls<T>(cssSelector);
        }

        public void GoToUrl(Uri uri)
        {
            Browser?.GoToUrl(uri);
        }
    }
}
