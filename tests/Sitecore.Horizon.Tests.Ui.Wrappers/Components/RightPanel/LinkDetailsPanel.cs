// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class LinkDetailsPanel
    {
        private readonly WebElement _linkDetailsPanel;

        public LinkDetailsPanel(WebElement linkDetailsPanel)
        {
            _linkDetailsPanel = linkDetailsPanel;
        }


        public string Path
        {
            get { return _pathElement.Text; }
            set
            {
                _pathElement.Container.JsClick();
                _pathElement.Text = value;
            }
        }

        public RteLinkTarget Target
        {
            get
            {
                string selectedOptionString = _target.SelectedOption;
                return selectedOptionString == "Same tab" ? RteLinkTarget.SameTab : RteLinkTarget.NewTab;
            }
            set
            {
                _target.Container.JsClick();
                string valueString = value == RteLinkTarget.SameTab ? "Same tab" : "New tab/window";
                _target.SelectByText(valueString);
            }
        }

        public string AlternativeText
        {
            get => _altText.Text;
            set
            {
                _altText.Container.JsClick();
                _altText.Container.SendKeys(value);
            }
        }

        TextBox _pathElement => new TextBox(_linkDetailsPanel.FindElement("app-rich-text-link input[placeholder*='URL']"));
        DropDown _target => new DropDown(_linkDetailsPanel.FindElement("app-rich-text-link select"));
        TextBox _altText => new TextBox(_linkDetailsPanel.FindElement("app-rich-text-link input[placeholder*='link title']"));
        WebElement _testUrlButton => _linkDetailsPanel.FindElement(".buttons button:nth-child(1)");
        WebElement _removeLlinkButton => _linkDetailsPanel.FindElement(".buttons button:nth-child(2)");

        public void RemoveLink()
        {
            _removeLlinkButton.JsClick();
            _removeLlinkButton.Driver.WaitForHorizonIsStable();
        }

        public void TestUrl()
        {
            _testUrlButton.JsClick();
            _testUrlButton.Driver.WaitForHorizonIsStable();
        }

        public void ClosePanel()
        {
            var driver = _linkDetailsPanel.Driver;
            var closeButton = _linkDetailsPanel.FindElement("button[ngSpdIconButton]");
            this.WaitForCondition(c => closeButton.Displayed);
            closeButton.Click();
            driver.WaitForHorizonIsStable();
        }
    }

    public enum RteLinkTarget
    {
        SameTab,
        NewTab
    }
}
