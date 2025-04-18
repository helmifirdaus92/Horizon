// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls
{
    public class PageDetailsDialog : BaseControl
    {
        public PageDetailsDialog(IWebElement container) : base(container) { }

        public bool IsDisplayNameEnabled => DisplayNameField.IsEnabled;

        private IWebElement CloseButton => Container.GetDriver().FindElement("app-lhs-panel button[icon='close']");
        private IWebElement Header => Container.FindElement("h1");
        private TextBox ItemNameField => Container.FindControl<TextBox>("#itemName");
        private TextBox DisplayNameField => Container.FindControl<TextBox>("#displayName");

        public string GetItemName() => ItemNameField.Text;
        public string GetDisplayName() => DisplayNameField.Text;

        public PageDesignInfo GetPageDesignTab() => GetSection<PageDesignInfo>("app-page-design");
        public InsertOptions GetInsertOptionsTab() => GetSection<InsertOptions>("app-page-insert-options");
        public AppPageDetail GetPageDetailsSection() => GetSection<AppPageDetail>("app-page-details");

        public void ScrollToView(string selector) => Container.FindElement(selector).Hover();

        public void ScrollToViewInsertOptions() => ScrollToView("app-page-insert-options");
        public void ScrollToViewPageDetails() => ScrollToView("app-page-details");
        public void ScrollToViewPageDesign() => ScrollToView("app-page-design");

        public void EnterItemName(string name) => UpdateTextField(ItemNameField, name);
        public void EnterDisplayName(string name) => UpdateTextField(DisplayNameField, name);

        public void Close()
        {
            CloseButton.Click();
            CloseButton.GetDriver().WaitForHorizonIsStable();
        }

        private T GetSection<T>(string selector) where T : BaseControl
        {
            var driver = Container.GetDriver();
            driver.WaitForCondition(d => d.CheckElementExists(selector));
            driver.WaitForHorizonIsStable();

            var sectionElement = Container.FindElement(selector)
                ?? throw new NullReferenceException($"Element with selector '{selector}' not found.");

            if (!IsSectionOpen(sectionElement))
            {
                sectionElement.Click();
                driver.WaitForCondition(d => IsSectionOpen(sectionElement));
                driver.WaitForHorizonIsStable();
            }

            return Activator.CreateInstance(typeof(T), sectionElement) as T
                ?? throw new InvalidOperationException($"Failed to create an instance of type {typeof(T).Name}.");
        }
        private bool IsSectionOpen(IWebElement sectionElement)
        {
            var headerIcon = sectionElement.FindElement(By.CssSelector("ng-spd-accordion-header .mdi-chevron-down"));
            return headerIcon.GetAttribute("class").Contains("expanded");
        }

        private void UpdateTextField(TextBox textBox, string value)
        {
            textBox.Clear();
            textBox.Text = value;
            LoseFocus();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        private void LoseFocus() => Header.Click();
    }
}
