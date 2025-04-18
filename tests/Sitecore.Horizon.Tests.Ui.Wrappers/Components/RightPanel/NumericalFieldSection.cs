// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class NumericalFieldSection
    {
        private readonly WebElement _container;

        public NumericalFieldSection(WebElement container)
        {
            _container = container;
        }

        public string CurrentValue => TextElement.Value;

        private WebElement TextElement => _container.FindElement("input");

        private WebElement ErrorMessage => _container.FindElement("label");

        public void SetNumberValue(string value)
        {
            TextElement.Clear();
            TextElement.Click();
            TextElement.SendKeys(value);
            TextElement.Driver.WaitForHorizonIsStable();
        }

        public bool IsValidationErrorMessageShown()
        {
            return ErrorMessage.Displayed;
        }

        public string GetValidationErrorMessage()
        {
            return ErrorMessage.Text;
        }
    }
}
