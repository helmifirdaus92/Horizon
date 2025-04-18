// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class ComponentsPanel
    {
        private WebElement _componentsPanel;

        public ComponentsPanel(WebElement componentsPanel)
        {
            _componentsPanel = componentsPanel;
        }

        public List<string> CompatibleRenderingsList => _compatibleRenderings.Select(rendering => rendering.Text.Trim()).ToList();
        public string NoAllowedComponentsMessage => _emptyState.FindElement("div h4").Text + _emptyState.FindElement(".ng-spd-empty-state-content div").Text;

        private WebElement _closeButton => _componentsPanel.FindElement("button i.filled.mdi.mdi-close");
        private IEnumerable<WebElement> _compatibleRenderings => _componentsPanel.FindElements("app-gallery-item").ToList();
        private WebElement _emptyState => _componentsPanel.FindElement("ng-spd-empty-state");

        public void Close()
        {
            _closeButton.Click();
            _componentsPanel.WaitForCSSAnimation();
        }

        public void SelectRenderingComponentByName(string name)
        {
            _compatibleRenderings.FirstOrDefault(rendering => rendering.Text.Equals(name)).Click();
            _componentsPanel.Driver.WaitForHorizonIsStable();
        }
    }
}
