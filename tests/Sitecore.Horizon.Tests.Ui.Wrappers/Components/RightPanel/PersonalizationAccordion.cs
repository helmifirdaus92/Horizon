// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageDesigning;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class PersonalizationAccordion : Accordion
    {
        private readonly WebElement _personalization;

        public PersonalizationAccordion(WebElement personalization) : base(personalization)
        {
            _personalization = personalization;
        }

        public string DatasourcePath => _dataSourceInput.GetTitle();
        public string ComponentNameInButton => _componentNameInButton.Text;

        private WebElement _dataSourceInput => _personalization.FindElement("div input");

        private WebElement _assignItemButton => _personalization.FindElement("div.datasource button");
        private WebElement _hideRenderingButton => _personalization.FindElement("ng-spd-switch");
        private WebElement _resetPersonalizationButton => _personalization.FindElement(".reset button");
        private WebElement _componentButton => _personalization.FindElement(".rendering button");
        private WebElement _componentNameInButton => _componentButton.FindElement(".content .row-two");
        private WebElement _backButton => _personalization.FindElement("ng-spd-slide-in-panel-header button .filled.mdi-arrow-left");

        public DatasourceDialog AssignItem()
        {
            _hideRenderingButton.Displayed.Equals(true);
            _assignItemButton.Click();
            return new DatasourceDialog(_personalization.Driver.FindElement(Constants.datasourceDialogSelector));
        }

        public void HideRendering()
        {
            _hideRenderingButton.Click();
        }

        public void ResetPersonalization()
        {
            _resetPersonalizationButton.Click();
        }

        public void OpenComponentsPanel()
        {
            _componentButton.Click();
            _personalization.FindElement("ng-spd-slide-in-panel").WaitForCSSAnimation();
        }

        public void GoBack()
        {
            _backButton.Click();
            _personalization.WaitForCSSAnimation();
        }
        public ComponentsPanel ComponentsPanel => new(_personalization.FindElement("ng-spd-slide-in-panel"));
    }
}
