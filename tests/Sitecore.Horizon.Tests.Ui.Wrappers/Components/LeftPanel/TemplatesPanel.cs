// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class TemplatesPanel
    {
        private readonly WebElement _templatesPanel;

        public TemplatesPanel(WebElement templatesPanel)
        {
            _templatesPanel = templatesPanel;
        }

        private WebElement PageTemplates => _templatesPanel.FindElement("ng-spd-list a[data-testid=nav-page-templates] span");
        private WebElement PartialDesigns => _templatesPanel.FindElement("ng-spd-list a[data-testid=nav-partial-designs] span");
        private WebElement PageDesigns => _templatesPanel.FindElement("ng-spd-list a[data-testid=nav-page-designs] span");
        

        public void OpenPageTemplates()
        {
            PageTemplates.Click();
            _templatesPanel.Driver.WaitForDotsLoader();
        }

        public void OpenPartialDesigns()
        {
            PartialDesigns.Click();
            _templatesPanel.Driver.WaitForDotsLoader();
        }

        public void OpenPageDesigns()
        {
            PageDesigns.Click();
            _templatesPanel.Driver.WaitForDotsLoader();
        }
    }
}
