// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls
{
    public class PageAbnTestDetailsDialog : BaseControl
    {
        public PageAbnTestDetailsDialog(IWebElement container) : base(container)
        {
        }

        private IWebElement Header => Container.FindElement("h1");
        private IWebElement VariantPerformanceTabButton => Container.FindElement("button[title='Variant performance']");
        private IWebElement AppliedConfigurationsTabButton => Container.FindElement("button[title='Applied configurations']");
        private IWebElement ViewAnalyticsButton => Container.FindElement(By.CssSelector(".footer-actions button:nth-of-type(1)"));
        private IWebElement GoToTestButton => Container.FindElement(By.CssSelector(".footer-actions button:nth-of-type(2)"));
        private IEnumerable<IWebElement> AbnTestItems => Container.FindElements(By.CssSelector("app-page-ab-tests-list .ab-test-item"));
        private IWebElement AllAbnTestsButton => Container.FindElement(By.CssSelector(".footer-actions button[icon='open-in-new']"));

        public VariantPerformanceTab OpenVariantPerformanceTab()
        {
            VariantPerformanceTabButton.Click();
            Container.GetDriver().WaitForDotsLoader();
            return new VariantPerformanceTab(Container.FindElement("app-page-ab-test-performance"));
        }

        public AppliedConfigurationsTab OpenAppliedConfigurationsTab()
        {
            AppliedConfigurationsTabButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            return new AppliedConfigurationsTab(Container.FindElement("app-page-ab-test-configuration"));
        }

        public bool IsViewAnalyticsButtonEnabled()
        {
            return ViewAnalyticsButton.Enabled;
        }

        public void ClickGoToTestButton()
        {
            GoToTestButton.Click();
        }

        public string GetTestStatusFromTheList(string testName)
        {
            var testElement = AbnTestItems.FirstOrDefault(item => item.FindElement(By.CssSelector(".ab-test-name")).Text.Trim().Equals(testName, StringComparison.OrdinalIgnoreCase));

            if (testElement == null)
            {
                throw new NoSuchElementException($"Test with name '{testName}' not found.");
            }

            return testElement.FindElement(By.CssSelector(".experiment-status span")).Text.Trim();
        }

        public List<string> GetAbnTestList()
        {
            return AbnTestItems.Select(item => item.FindElement(By.CssSelector(".ab-test-name")).Text.Trim()).ToList();
        }

        public void ClickOnTheTest(string testName)
        {
            var testElement = AbnTestItems.FirstOrDefault(item => item.FindElement(By.CssSelector(".ab-test-name")).Text.Trim().Equals(testName, StringComparison.OrdinalIgnoreCase));

            if (testElement == null)
            {
                throw new NoSuchElementException($"Test with name '{testName}' not found.");
            }

            var chevronIcon = testElement.FindElement(By.CssSelector(".mdi-chevron-right.icon-normal"));
            chevronIcon.Click();
        }

        public void ClickAllAbnTestsLink()
        {
            AllAbnTestsButton.Click();
        }
    }
}
