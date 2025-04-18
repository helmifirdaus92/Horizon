// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel
{
    public class PersonalizationDetails : BaseControl
    {
        public PersonalizationDetails(IWebElement container) : base(container)
        {
        }

        public bool BrowseDataSourceEnabled => BrowseDatasourceElement.Enabled;
        public bool ChangeComponentButtonEnabled => ChangeComponentButton.IsEnabled;
        public bool HideComponentEnabled => !HideComponentToggle.GetClassList().Contains("spd-disabled");
        public bool ResetPersonalizationEnabled => ResetPersonalizeButton.IsEnabled;

        private IWebElement DatasourcePathElement => Container.FindElement(".datasource-input");
        private IWebElement BrowseDatasourceElement => Container.FindElement(".browse-btn");
        private Button ChangeComponentButton => Container.FindControl<Button>(".rendering button");
        private IWebElement HideComponentToggle => Container.FindElement("ng-spd-switch div");
        private Button ResetPersonalizeButton => Container.FindControl<Button>(".reset button");
    }
}
