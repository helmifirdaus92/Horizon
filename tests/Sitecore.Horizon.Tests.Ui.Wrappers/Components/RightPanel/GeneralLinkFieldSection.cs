// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Services;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class GeneralLinkFieldSection
    {
        private WebElement _generalLinkFieldSectionControl;
        private JsHelper jsHelper;

        public GeneralLinkFieldSection(WebElement generalLinkFieldSectionControl)
        {
            _generalLinkFieldSectionControl = generalLinkFieldSectionControl;
            jsHelper = new JsHelper(_generalLinkFieldSectionControl.Driver);
        }

        public string LinkType => LinkTypeSelectButton.Text.Trim();
        public string LinkUrl => new TextBox(LinkUrlElement).Text;
        public string LinkPath => FindWebElementInGeneralLinkSection("input[name='path']").Value;
        public string LinkText => new TextBox(LinkTextElement).Text;
        public string AlternativeText => new TextBox(LinkTitle).Text;
        public bool OpenInNewWindowEnabled => OpenInNewWindowCheckboxElement.GetClass() == "checked";

        private WebElement LinkTypeSelectButton => _generalLinkFieldSectionControl.FindElement("ng-spd-droplist button");
        private WebElement LinkUrlElement => FindWebElementInGeneralLinkSection("input[name='linkUrl']");
        private WebElement LinkAnchorElement => FindWebElementInGeneralLinkSection("input[name='linkAnchor']");
        private WebElement LinkQuerystringElement => FindWebElementInGeneralLinkSection("input[name='linkQuerystring']");
        private WebElement LinkTextElement => FindWebElementInGeneralLinkSection("input[name='linkText']");
        private WebElement LinkTitle => FindWebElementInGeneralLinkSection("input[name='linkTitle']");
        private WebElement OpenInNewWindowCheckboxElement => FindWebElementInGeneralLinkSection("ng-spd-checkbox");
        private WebElement BrowseContentItemButton => FindWebElementInGeneralLinkSection("app-internal-link button");


        public void SelectLinkType(string linkType)
        {
            LinkTypeSelectButton.Click();

            WebElement option = null;
            this.WaitForCondition((c) =>
            {
                option = _generalLinkFieldSectionControl.Driver
                    .FindElements("ng-spd-droplist-item").FirstOrDefault((el) => el.Text.Trim() == linkType);
                return option != null;
            }, 2000, failOnFalse: true);

            option.Click();
            LinkTypeSelectButton.Driver.WaitForHorizonIsStable();
        }

        public void OpenOptionalParametersAccordion()
        {
            _generalLinkFieldSectionControl.FindElement("ng-spd-contained-accordion button").Click();
            this.WaitForCondition((c) => OpenInNewWindowCheckboxElement.Displayed, 2000);
        }

        public void SetLinkUrl(string linkPath)
        {
            SetTextField(LinkUrlElement, linkPath);
        }

        public void SetLinkText(string linkText)
        {
            SetTextField(LinkTextElement, linkText);
        }

        public void SetLinkTitle(string linkTitle)
        {
            SetTextField(LinkTitle, linkTitle);
        }

        public void SetAnchor(string anchor)
        {
            SetTextField(LinkAnchorElement, anchor);
        }

        public void SetQuerystring(string querystring)
        {
            SetTextField(LinkQuerystringElement, querystring);
        }

        public void CheckOpenInNewWindow(bool enable)
        {
            if (enable && !OpenInNewWindowEnabled || !enable && OpenInNewWindowEnabled)
            {
                OpenInNewWindowCheckboxElement.Click();
            }
        }

        public InternalLinkDialog.InternalLinkDialog OpenInternalLinkDialog()
        {
            BrowseContentItemButton.Click();
            var container = _generalLinkFieldSectionControl.Driver.FindElement("app-content-item-dialog");
            _generalLinkFieldSectionControl.Driver.WaitForHorizonIsStable();

            return new InternalLinkDialog.InternalLinkDialog(container);
        }

        private void SetTextField(WebElement textFieldElement, string textValue)
        {
            textFieldElement.Clear();
            textFieldElement.Click();
            textFieldElement.SendKeys(textValue);
            textFieldElement.Driver.WaitForHorizonIsStable();
        }

        private WebElement FindWebElementInGeneralLinkSection(string cssSelector)
        {
            return _generalLinkFieldSectionControl.FindElement(cssSelector);
        }
    }
}
