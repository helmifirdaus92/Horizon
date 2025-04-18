// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls
{
    public class AppPageDetail : Accordion
    {
        public AppPageDetail(IWebElement section) : base(section)
        {
        }

        public string? GetValueByLabel(string labelClass)
        {
            IReadOnlyCollection<IWebElement> labels = Container.FindElements(By.CssSelector(".hrz-test-label"));
            IReadOnlyCollection<IWebElement> values = Container.FindElements(By.CssSelector(".hrz-test-value"));

            for (int i = 0; i < labels.Count; i++)
            {
                string label = labels.ElementAt(i).Text.Trim();
                if (label.Equals(labelClass, StringComparison.OrdinalIgnoreCase))
                {
                    return values.ElementAt(i).Text.Trim();
                }
            }

            return null;
        }
    }
}
