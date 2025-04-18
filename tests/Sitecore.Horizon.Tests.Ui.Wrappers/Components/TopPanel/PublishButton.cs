// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class PublishButton
    {
        private WebElement _container;

        public PublishButton(WebElement container)
        {
            _container = container;
        }

        private WebElement _publishMainButton => _container.FindElement("#publishBtn");

        private WebElement _publishContextMenu => _container.Driver.FindElement("ng-spd-popover ng-spd-list");

        private WebElement _publishMainButtonTitle => _container.Driver.FindElement("ng-spd-popover .popover-dialog span");

        private WebElement _publishPageContextButton => _publishContextMenu.FindElements("button")[0];

        private WebElement _publishPageWithSubPagesContextButton => _publishContextMenu.FindElements("ng-spd-list button")[1];

        public bool IsPublishing => _publishMainButton.Text.Contains("Publishing");

        public bool IsDisable => _publishMainButton.HasAttribute("disabled");

        public bool Exists => _container.FindElements("#publishBtn").Any();

        public void PublishPage()
        {
            _publishMainButton.Click();
            _container.Driver.WaitForHorizonIsStable();
            _publishPageContextButton.Click();
            _container.Driver.WaitForHorizonIsStable();
        }

        public void PublishPageWithSubPages()
        {
            _publishMainButton.Click();
            _container.Driver.WaitForHorizonIsStable();
            _publishPageWithSubPagesContextButton.Click();
            _container.Driver.WaitForHorizonIsStable();
        }

        public string GetButtonTitle()
        {
            _publishMainButton.GetParent().Hover();
            return _publishMainButtonTitle.Text;
        }
    }
}
