// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.LeftHandPanel
{
    public class PersonalizationPanel : BaseControl
    {
        public PersonalizationPanel(IWebElement container) : base(container)
        {
        }

        public Button CreateNewButton => Container.FindControl<Button>("ng-spd-header-with-button button");
        public bool CreateVariantEnabled => CreateNewButton.IsEnabled;

        public CreateDialog CreateDialog => new(Container.GetDriver().FindElement(Constants.DialogPanelLocator));

        private IEnumerable<IWebElement> VariantsList => Container.FindElements("ng-spd-list button[role=listitem]").ToList();
        public List<string> GetListOfVariants() => VariantsList.Select(variant => variant.FindElement(".text").Text).ToList();

        private IWebElement ContextMenuDots => SelectedVariant.FindElement("app-personalization-context-menu, .filled.mdi-dots-horizontal");
        private IWebElement SelectedVariant => VariantsList.First(segment => segment.GetClassList().Contains("select"));
        public string SelectedVariantName => SelectedVariant.FindElement(".text").Text;
        public EditAudienceDialog EditAudienceDialog => new(Container.GetDriver().FindElement(Constants.DialogPanelLocator));

        public string AudienceNameInSelectedVariant => SelectedVariant.FindElement(".audience-title").Text;

        private IWebElement NoPosTemplate => Container.FindElement(".no-pos-template");
        public string NoPosTemplateText => NoPosTemplate.Text;

        private IWebElement SettingsLink => NoPosTemplate.FindElement("a");
        public string SettingsLinkText => SettingsLink.Text;
        public string SettingsUrl => SettingsLink.GetAttribute("href");
        public string DescriptionText => Container.FindElement(".header .description").Text;

        public bool PersonalizationDisabledDueToComponentTest()
        {
            return Container.CheckElementExists(".component-test-enabled-template:only-child");
        }

        public void ClickOnCreateNew()
        {
            Container.GetDriver().WaitForLoaderToDisappear();
            this.WaitForCondition(c => CreateVariantEnabled);
            CreateNewButton.Click();
        }

        public void CreateNewVariant(string variantName)
        {
            ClickOnCreateNew();
            CreateDialog.CreateNewVariant(variantName);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void SelectVariantByName(string variantName)
        {
            VariantsList.First(s => s.FindElement(".text").Text.Contains(variantName)).Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public ContextMenu InvokeContextMenu()
        {
            ContextMenuDots.Hover();
            ContextMenuDots.Click();
            ContextMenuDots.GetDriver().WaitForHorizonIsStable();
            return new ContextMenu(Container.GetDriver().FindElement("ng-spd-popover"));
        }

        public void EditAudience(string audienceName)
        {
            EditAudienceDialog.SetAudienceName(audienceName);
        }

        public void RenameVariant(string newVariantName)
        {
            SelectedVariant.FindElement("span[contenteditable = 'true']").SendKeys(newVariantName);
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
