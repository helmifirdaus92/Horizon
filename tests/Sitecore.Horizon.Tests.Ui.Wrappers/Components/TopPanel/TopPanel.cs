// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class TopPanel
    {
        private readonly WebElement _topPanel;

        public TopPanel(WebElement element)
        {
            _topPanel = element;
        }

        public string UserName => UserProfileBar.GetTitle();
        public string UserPortraitIconUrl => UserProfileBar.FindElement(".profile-icon").GetAttribute("src");

        public bool LogOutPopUpDisplayed => _logOut.Displayed;
        public string AppName => _topPanel.FindElement("app-application-links .active-app-name").Text;
        public bool UndoEnabled => IsControlEnabled(UndoControl);
        public bool RedoEnabled => IsControlEnabled(RedoControl);
        public string SiteName => _siteName.Text;
        public Versions Versions => new(_topPanel.FindElement("app-versions"));
        public WebElement VersionButton => _topPanel.Driver.FindElement("app-versions #versionListBtn");
        private WebElement UserProfileBar => _topPanel.Driver.FindElement(".profile-bar");
        private WebElement SiteSwitcher => _topPanel.Driver.FindElement("app-site-language-dropdowns button#site-switcher-btn");
        private WebElement LanguageSwitcher => _topPanel.Driver.FindElement("app-site-language-dropdowns button#language-switcher-btn");
        private IReadOnlyCollection<WebElement> ListElements => Context.Driver.FindElements("ng-spd-popover ng-spd-list button").ToList();
        private WebElement UndoControl => _topPanel.Driver.FindElement("app-save-undo-redo button[title='Undo']");
        private WebElement RedoControl => _topPanel.Driver.FindElement("app-save-undo-redo button[title='Redo']");

        private WebElement _logOut => _topPanel.Driver.FindElement("ng-spd-popover a");
        private WebElement _siteName => _topPanel.FindElement("app-top-bar #site-switcher-btn");
        private WebElement PageInfo => _topPanel.FindElement("div.page-info.ng-star-inserted");

        public void Undo()
        {
            NavigateByHistory(UndoControl);
        }

        public void Redo()
        {
            NavigateByHistory(RedoControl);
        }

        public void NavigateToLaunchpad()
        {
            _topPanel.Driver.FindElement("app-application-links a").Click();
            _topPanel.Driver.WaitForDocumentLoaded();
        }

        public void ClickOnHelpIcon()
        {
            _topPanel.Driver.FindElement("i[class*='spd-help']").Click();
        }

        public void SelectLanguage(string language)
        {
            OpenLanguagesDropdown();
            WebElement languageToSelect = ListElements.First(s => s.InnerHtml.Contains(language));
            if (languageToSelect == null)
            {
                throw new Exception("language to select does not exist");
            }

            languageToSelect.Click();
            Thread.Sleep(200);
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        public string GetSelectedLanguage()
        {
            return LanguageSwitcher.FindElement(".ng-spd-droplist-toggle-content").Text;
        }

        public List<string> GetAvailableLanguagesFromSwitcher()
        {
            OpenLanguagesDropdown();
            return ListElements.Select(el => el.FindElement("div .lang-displayName").Text).ToList();
        }

        public List<(string name, string nativeName)> GetAvailableLanguagesWithNativeNamesFromSwitcher()
        {
            OpenLanguagesDropdown();
            List<(string, string)> languages = ListElements.Select(el => (el.FindElement("div .lang-displayName").Text, el.FindElement("div").Text)).ToList();
            return languages;
        }

        public void SelectSite(string site)
        {
            OpenSitesDropdown();
            WebElement siteToSelect = ListElements.First(s => s.Text == site);
            if (siteToSelect == null)
            {
                throw new Exception("Website to select does not exist");
            }

            siteToSelect.Click();
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        public string GetSelectedSite()
        {
            return SiteSwitcher.FindElement(".ng-spd-droplist-toggle-content").Text;
        }

        public List<string> GetAvailableSitesFromSwitcher()
        {
            OpenSitesDropdown();
            return ListElements.Select(ie => ie.Text).ToList();
        }


        public void ClickOnPortraitIcon()
        {
            UserProfileBar.Click();
        }

        public void LogOut()
        {
            _logOut.Click();
        }

        public void OpenVersions()
        {
            VersionButton.Click();
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        public void CloseVersions()
        {
            if (!isVersionPopoverComponentOpened())
            {
                return;
            }

            VersionButton.Click();
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        public WorkflowBar GetWorkflowBar()
        {
            var workflowElement = _topPanel.FindElement("app-workflow-bar");
            return new WorkflowBar(workflowElement);
        }

        private bool IsControlEnabled(WebElement control)
        {
            return !control.HasAttribute("disabled");
        }

        private void NavigateByHistory(WebElement control)
        {
            control.WaitForCondition(IsControlEnabled, 2000);

            control.Click();
            control.Driver.WaitForHorizonIsStable();
        }

        private void OpenLanguagesDropdown()
        {
            if (IsPopoverComponentOpened())
            {
                LanguageSwitcher.Click();
                _topPanel.Driver.WaitForHorizonIsStable();
            }

            LanguageSwitcher.Click();
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        private void OpenSitesDropdown()
        {
            if (IsPopoverComponentOpened())
            {
                SiteSwitcher.Click();
                _topPanel.Driver.WaitForHorizonIsStable();
            }

            SiteSwitcher.Click();
            _topPanel.Driver.WaitForHorizonIsStable();
        }

        private bool IsPopoverComponentOpened()
        {
            _topPanel.Driver.WaitForHorizonIsStable();
            return _topPanel.Driver.CheckElementExists("ng-spd-popover-wrapper");
        }

        private bool isVersionPopoverComponentOpened()
        {
            _topPanel.Driver.WaitForHorizonIsStable();
            return _topPanel.Driver.CheckElementExists("ng-spd-popover-wrapper app-version-list");
        }
    }
}
