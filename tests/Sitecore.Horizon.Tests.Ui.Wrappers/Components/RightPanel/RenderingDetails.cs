// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageDesigning;
using UTF;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class RenderingDetails
    {
        private readonly WebElement _container;

        public RenderingDetails(WebElement container)
        {
            _container = container;
        }

        public string DatasourcePathValue => DatasourcePathElement.GetTitle();
        public string DatasourcePathPlaceholderValue => DatasourcePathElement.GetAttribute("placeholder");

        private WebElement DatasourcePathElement => _container.FindElement(".datasource input");
        private WebElement BrowseDatasourceButtonElement => _container.FindElement(".browse-btn");
        private WebElement DeleteRenderingButtonElement => _container.FindElement("button.delete");
        private WebElement CreateNewButtonElement => _container.FindElement(".header-section>button");

        public void ClickOnDeleteRenderingButton()
        {
            DeleteRenderingButtonElement.Click();
            _container.Driver.WaitForHorizonIsStable();
        }

        public bool IsDeleteButtonEnabled()
        {
            return DeleteRenderingButtonElement.Enabled;
        }
    }
}
