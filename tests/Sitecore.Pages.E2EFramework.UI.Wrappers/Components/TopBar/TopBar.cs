// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopPanel;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar
{
    public class TopBar : BaseControl
    {
        private const string VersionListPopOverLocator = "ng-spd-popover app-version-list";
        private readonly Action? _canvasReloadWaitMethod;

        public TopBar(IWebElement container, Action? canvasReloadWaitMethod) : base(container)
        {
            _canvasReloadWaitMethod = canvasReloadWaitMethod;
        }

        public TopBar(IWebElement container) : base(container)
        {
        }

        public NavigationPanel AppNavigation => new(Container.FindElement("app-navigation-bar"));

        public WorkflowBar WorkflowBar => new(Container.FindElement("app-workflow-bar"));

        public DeviceSwitcher Device
        {
            get
            {
                return new DeviceSwitcher(Container.FindElement("app-device-selector"));
            }
        }

        public bool IsVersionListOpened => Container.GetDriver().CheckElementExists(VersionListPopOverLocator);

        private Button XMAppsDashboard => Container.FindControl<Button>("app-application-links a");
        private IWebElement XMAppsDashboardLink => Container.FindElement("app-application-links a");
        private IWebElement SiteSwitcherPopoverElement => Container.GetDriver().FindElement("ng-spd-popover-wrapper");
        private Button SiteSwitcher => Container.GetDriver().FindControl<Button>("app-site-language-dropdowns #site-switcher-btn");
        private Button LanguageSwitcher => Container.FindControl<Button>("app-site-language-dropdowns #language-switcher-btn");
        private IWebElement PageInfo => Container.FindElement("div.page-info.ng-star-inserted");

        private IReadOnlyCollection<IWebElement> Languages => Container.GetDriver().FindElements("ng-spd-popover ng-spd-list#language-switcher-list button").ToList();
        private IWebElement SharedLayoutSwitcher => Container.GetDriver().FindElement("app-layout-switch .spd-toggle-button-box");

        private IWebElement Preview => Container.FindElement("app-horizon-workspace-header-preview-link [title=Preview]");

        public void OpenPreview()
        {
            Preview.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            Container.GetDriver().WaitForCondition(b => b.WindowHandles.Count > 1);
        }

        public void OpenXMAppsDashboard()
        {
            XMAppsDashboard.Click();
        }

        public string GetLDashboardLink()
        {
            return XMAppsDashboardLink.GetAttribute("href");
        }

        public string GetSelectedLanguage()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            return LanguageSwitcher.Container.Text.Trim();
        }

        public string GetSelectedSite()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            return SiteSwitcher.Container.FindElement(".active-site").Text.Trim();
        }

        public void SelectLanguage(string language)
        {
            OpenLanguagesDropdown();
            IWebElement languageToSelect = Languages.First(s => s.GetInnerHtml().Contains(language));
            if (languageToSelect == null)
            {
                throw new Exception("language to select does not exist");
            }

            languageToSelect.Click();
            _canvasReloadWaitMethod?.Invoke();
        }

        public List<string> GetAllLanguages()
        {
            OpenLanguagesDropdown();
            WaitForNonEmptyList(Languages);
            var languageElements = Languages;
            var languages = languageElements.Select(e => e.Text.Trim()).ToList();
            CloseLanguagesDropdown();
            return languages;
        }

        public void SetSharedLayout()
        {
            SharedLayoutSwitcher.Click();
            _canvasReloadWaitMethod?.Invoke();
        }

        public void SetFinalLayout()
        {
            if (SharedLayoutSwitcher.GetClass().Contains("spd-toggle-button-checked"))
            {
                SharedLayoutSwitcher.Click();
                _canvasReloadWaitMethod?.Invoke();
            }
        }
        public void CloseLanguagesDropdown()
        {
            if (!IsPopoverComponentOpened())
            {
                return;
            }

            Container.GetDriver().FindElement("ng-spd-popover-wrapper").ClickOutside();

            Container.GetDriver().WaitForHorizonIsStable();
        }

        public string GetInnerHtml(IWebElement container)
        {
            return container.GetInnerHtml();
        }

        private void WaitForNonEmptyList(IReadOnlyCollection<IWebElement> elements)
        {
            Container.GetDriver().WaitForCondition(d =>
                {
                    return elements.All(e => !string.IsNullOrWhiteSpace(e.Text));
                }
            );
        }

        private void OpenLanguagesDropdown()
        {
            if (IsPopoverComponentOpened())
            {
                LanguageSwitcher.Click();
                Container.GetDriver().WaitForHorizonIsStable();
                return;
            }

            LanguageSwitcher.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public SiteSwitcherPopover OpenSitesDropdown()
        {
            if (!IsPopoverComponentOpened())
            {
                SiteSwitcher.Click();
                SiteSwitcherPopoverElement.WaitForCondition(e => e.Enabled);
            }

            return new(Container.GetDriver().FindElement("ng-spd-popover-wrapper"));
        }

        private bool IsPopoverComponentOpened()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            return Container.GetDriver().CheckElementExists("ng-spd-popover-wrapper");
        }
    }
}
