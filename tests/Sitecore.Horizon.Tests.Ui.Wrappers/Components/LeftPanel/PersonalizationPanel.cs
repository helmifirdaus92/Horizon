// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;
using Keys = OpenQA.Selenium.Keys;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class PersonalizationPanel
    {
        private readonly WebElement _personalizationTab;

        //private readonly string _createPersonalizationSlidingPanelSelector = "ng-spd-slide-in-panel";

        public PersonalizationPanel(WebElement personalizationTab)
        {
            _personalizationTab = personalizationTab;
        }

        public CreateVariantDialog CreateVariantDialog => new(_personalizationTab.Driver.FindElement("ng-spd-dialog-panel"));
        public EditAudienceDialog EditAudienceDialog => new(_personalizationTab.Driver.FindElement("ng-spd-dialog-panel"));
        public string SelectedVariantName => _selectedVariant.FindElement(".text").Text;
        public string AudienceNameInSelectedVariant => _selectedVariant.FindElement(".audience-title").Text;
        public string NoPosTemplateText => _noPosTemplate.Text;
        public string SettingsUrl => _settingsLink.GetAttribute("href");
        public string SettingsLinkText => _settingsLink.Text;

        private WebElement _selectedVariant => _variantsList.Find(segment => segment.GetClassList().Contains("select"));
        private WebElement _header => _personalizationTab.FindElement(".header-container .header .title");
        private WebElement _createnew => _personalizationTab.FindElement(".subheader button");
        private List<WebElement> _variantsList => _personalizationTab.FindElements("ng-spd-list button[role=listitem]").ToList();
        private WebElement _contextMenuDots => _selectedVariant.FindElement(".mdi-dots-horizontal");
        private WebElement _noPosTemplate => _personalizationTab.FindElement(".no-pos-template");
        private WebElement _settingsLink => _noPosTemplate.FindElement("a");

        public bool IsOpened()
        {
            return _header.Displayed;
        }

        public void SelectVariantByName(string variantName)
        {
            _variantsList.Find(s => s.FindElement(".text").Text.Contains(variantName)).Click();
            _personalizationTab.Driver.WaitForHorizonIsStable();
        }

        public void RenameVariant(string newVariantName)
        {
            _selectedVariant.WaitForCondition(s => s.FindElement("span[contenteditable = 'true']").Exists);
            _selectedVariant.FindElement("span[contenteditable = 'true']").Clear();
            _selectedVariant.FindElement("span[contenteditable = 'true']").SendKeys(newVariantName);
            _personalizationTab.Driver.PressKeySelenium(Keys.Enter);
            _personalizationTab.Driver.WaitForHorizonIsStable();
        }

        public void ClickOnCreateNew()
        {
            _createnew.Click();
        }

        public List<string> GetListOfVariants() => _variantsList.Select(variant => variant.FindElement(".text").Text).ToList();

        public void CreateNewVariant(string variantName)
        {
            ClickOnCreateNew();
            CreateVariantDialog.CreateNewVariant(variantName);
            _personalizationTab.Driver.WaitForHorizonIsStable();
        }

        public ContextMenu InvokeContextMenu()
        {
            _contextMenuDots.Hover();
            _contextMenuDots.Click();
            _contextMenuDots.Driver.WaitForHorizonIsStable();
            return new ContextMenu(_personalizationTab.Driver.FindElement("ng-spd-popover"));
        }

        public void EditAudience(string audienceName)
        {
            EditAudienceDialog.SetAudienceName(audienceName);
        }
    }
}
