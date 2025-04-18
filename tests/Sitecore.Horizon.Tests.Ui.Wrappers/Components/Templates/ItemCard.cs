// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class ItemCard
    {
        private readonly WebElement _card;
        private readonly string _cdkOverlayContainerCdkOverlayPane = ".cdk-overlay-container .cdk-overlay-pane";

        public ItemCard(WebElement card)
        {
            _card = card;
        }

        public ContextMenu OpenContextMenu()
        {
            _card.FindElement("button[icon='dots-horizontal']").Click();
            _card.Driver.WaitForContextMenu();
            return new ContextMenu(_card.Driver.FindElement(_cdkOverlayContainerCdkOverlayPane));
        }
    }
}
