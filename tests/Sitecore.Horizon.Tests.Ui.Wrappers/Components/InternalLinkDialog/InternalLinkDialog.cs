// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.InternalLinkDialog
{
    public class InternalLinkDialog
    {
        private WebElement _dialogControl;

        public InternalLinkDialog(WebElement container)
        {
            _dialogControl = container;
        }

        public ItemsTree ItemsTree => new ItemsTree(_dialogControl.FindElement(".picker-dialog-body"), canvasReloadWaitMethod: null);

        private WebElement _cancelButton => _dialogControl.FindElement("ng-spd-dialog-actions>button");
        private WebElement _addLinkButton => _dialogControl.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");
        private WebElement SiteSwitcher => _dialogControl.FindElement("app-site-language-dropdowns button:nth-child(1)");
        private WebElement LanguageSwitcher => _dialogControl.FindElement("app-site-language-dropdowns button:nth-child(2)");
        private IReadOnlyCollection<WebElement> ListElements => Context.Driver.FindElement("ng-spd-list").GetChildren();

        public bool IsCancelButtonEnabled()
        {
            return _cancelButton.Enabled;
        }

        public bool IsAssignButtonEnabled()
        {
            return _addLinkButton.Enabled;
        }

        public void Cancel()
        {
            _cancelButton.Click();
            _cancelButton.Driver.WaitForHorizonIsStable();
        }

        public void PressAddLinkButton()
        {
            _addLinkButton.Click();
            _addLinkButton.Driver.WaitForHorizonIsStable();
        }

        public void PressCancelButton()
        {
            _cancelButton.Click();
            _addLinkButton.Driver.WaitForHorizonIsStable();
        }

        public void SelectLanguage(string language)
        {
            LanguageSwitcher.Click();
            _dialogControl.Driver.WaitForHorizonIsStable();
            var languageToSelect = ListElements.First(s => s.InnerHtml.Contains(language));
            if (languageToSelect == null)
            {
                throw new Exception("language to select does not exist");
            }

            languageToSelect.Click();
            Thread.Sleep(200);
            _dialogControl.Driver.WaitForHorizonIsStable();
        }

        public string GetSelectedLanguage() => LanguageSwitcher.FindElement(".ng-spd-droplist-toggle-content").Text;
        public List<string> GetAvailableLanguagesFromSwitcher()
        {
            LanguageSwitcher.Click();
            _dialogControl.Driver.WaitForHorizonIsStable();

            return ListElements.Select(el => el.Text.Replace("\n", "").Split('\r').ToList()).Select(l => l[1]).ToList();
        }


        public void SelectSite(string site)
        {
            SiteSwitcher.Click();
            var siteToSelect = ListElements.First(s => s.Text == site);
            if (siteToSelect == null)
            {
                throw new Exception("Website to select does not exist");
            }

            siteToSelect.Click();
            _dialogControl.Driver.WaitForHorizonIsStable();
        }

        public string GetSelectedSite() => SiteSwitcher.FindElement(".ng-spd-droplist-toggle-content").Text;
        public List<string> GetAvailableSitesFromSwitcher()
        {
            SiteSwitcher.Click();
            _dialogControl.Driver.WaitForHorizonIsStable();
            return ListElements.Select(ie => ie.Text).ToList();
        }
    }
}
