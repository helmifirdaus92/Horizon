// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class SlidingPanelHeader
    {
        private readonly WebElement _slidingPanelHeader;

        public SlidingPanelHeader(WebElement slidingPanelHeader)
        {
            _slidingPanelHeader = slidingPanelHeader;
        }

        public string HeaderText => _slidingPanelHeader.FindElement("h4").Text;

        public void NavigateBack() => _slidingPanelHeader.FindElement("button").Click();
    }
}
