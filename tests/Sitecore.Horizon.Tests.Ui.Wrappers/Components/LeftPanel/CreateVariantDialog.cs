// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class CreateVariantDialog
    {
        private WebElement _createVariantDialog;

        public CreateVariantDialog(WebElement createVariantDialog)
        {
            _createVariantDialog = createVariantDialog;
        }


        public string HeaderText => _createVariantDialog.FindElement("ng-spd-dialog-header").Text;
        public string ActiveStep => _createVariantDialog.FindElement("app-stepper .steps.active .text").Text;
        public string ValidationErrorMsg => _createVariantDialog.FindElement(".error-block p").Text;

        private WebElement _closeButton => _createVariantDialog.FindElement("ng-spd-dialog-close-button button");

        private List<WebElement> _ctaButtons => _createVariantDialog.FindElements("ng-spd-dialog-actions button").ToList();
        private WebElement _variantInput => _createVariantDialog.FindElement("input#variant-name");
        private WebElement _audienceInout => _createVariantDialog.FindElement("label[for=audience-name] + input");
        private WebElement _saveAudienceButton => _createVariantDialog.FindElement(".disconnected + button");

        private WebElement _header => _createVariantDialog.FindElement("ng-spd-slide-in-panel-header");

        public void CreateNewVariant(string variantName)
        {
            EnterVariantName(variantName);
            ClickNext();
            _audienceInout.TypeKeys(variantName + "_audience");
            _saveAudienceButton.Click();
        }

        public void ClickNext()
        {
            _ctaButtons[1].Click();
        }

        public void EnterVariantName(string variantName)
        {
            _variantInput.TypeKeys(variantName);
        }

        public string GetVariantNameValidationErrorMsg(string variantName)
        {
            EnterVariantName(variantName);
            return ValidationErrorMsg;
        }

        public void Close()
        {
            _closeButton.Click();
        }
    }
}
