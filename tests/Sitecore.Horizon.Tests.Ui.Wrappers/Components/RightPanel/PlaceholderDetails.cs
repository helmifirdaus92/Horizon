// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class PlaceholderDetails
    {
        private readonly WebElement _container;

        public PlaceholderDetails(WebElement container)
        {
            _container = container;
        }

        public string PlaceholderKey => GetItemParameterText("Placeholder key");

        private string GetItemParameterText(string propertyName)
        {
            _container.WaitForCondition(props => _container.FindElements(".ph-details .header").Any(x => x.Text.Contains(propertyName)));

            var properties = _container.FindElements(".ph-details .header");

            return properties.First(el => el.Text.Contains(propertyName)).GetNextSibling().Text;
        }
    }
}
