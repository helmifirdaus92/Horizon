// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages
{
    public class TenantModalWindow : Modal
    {
        public TenantModalWindow(IWebElement container) : base(container)
        {
        }

        private IReadOnlyCollection<IWebElement> QuickActions => Container.FindElements("button.media");

        private IWebElement _pages => Container.FindElement("[data-testid='app drawer - Page builder']");

        public void OpenPages()
        {
            _pages.Click();
        }
    }
}
