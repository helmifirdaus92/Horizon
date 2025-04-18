// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages
{
    public class PortalPage : BasePage
    {
        private readonly string _showMoreButtonSelector = "[data-testid=show-all-button]";
        private readonly string _overlayContainerSelector = ".chakra-modal__content-container";

        public PortalPage(IWebDriver driver) : base(driver)
        {
            WaitForLoading();
        }

        public List<IWebElement> Apps => Driver.FindElements("[data-testid*=app-card]").ToList();

        public NamedCollection<Button> QuickActions => Driver.FindNamedControls<Button>("[data-testid=quick-actions-block] button.media h3");
        public TenantModalWindow TenantPanel => Driver.FindControl<TenantModalWindow>("[role=dialog]");

        public Button? ShowMoreButton => Driver.CheckElement(_showMoreButtonSelector) != null ? Driver.FindControl<Button>(_showMoreButtonSelector) : null;

        public string WelcomeMessage => Driver.FindElement("h2.chakra-heading").Text;

        private Modal ContainerModal => Driver.FindControl<Modal>(_overlayContainerSelector);

        public void WaitForLoading()
        {
            QuickActions.WaitForCondition(qab =>
                qab.Names.All(n => n.Any()) && WelcomeMessage.Any());
        }

        public void SelectTenant(string proJectName, string envName)
        {
            Apps.First(t => t.GetAttribute("data-appname").Contains(proJectName + " / " + envName)).Click();
        }

        public void CloseAnyOverlayIfDisplayed()
        {
            if (Driver.CheckElement(_overlayContainerSelector) != null)
            {
                ContainerModal.Close.Click();
                Driver.WaitForCondition(driver => driver.CheckElement(_overlayContainerSelector) == null);
            }
        }

        public void ClickShowMoreButton()
        {
            if (ShowMoreButton != null)
            {
                ShowMoreButton.Click();
            }
            else
            {
                Logger.Write("Show more button is not visible continuing with existing list in view");
            }
        }
    }
}
