// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList
{
    public class SelectTemplateCard
    {
        private WebElement _card;

        public SelectTemplateCard(WebElement card)
        {
            _card = card;
        }

        public string Title => _title.Text;

        private WebElement _title => _card.FindElement(".header-content .title");

        public SelectTemplateCard Select()
        {
            _card.Click();
            return this;
        }

        public bool IsSelected() { return _card.GetClassList().Contains("selected"); }
    }
}
