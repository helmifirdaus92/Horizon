// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class CreateVersion
    {
        private readonly WebElement _createVersion;

        public CreateVersion(WebElement createVersion)
        {
            _createVersion = createVersion;
        }

        public WebElement Header => _createVersion.FindElement("ng-spd-dialog-header");
        public WebElement VersionName => _createVersion.FindElement("input");
        public WebElement CancelButton => _createVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(1)");
        public WebElement CreateButton => _createVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(2)");


        public void Create(string versionName = null)
        {
            if (versionName != null)
            {
                VersionName.SendKeys(versionName);
            }
            CreateButton.Hover();
            CreateButton.Click();
            _createVersion.WaitForCSSAnimation();
        }

        public void Cancel()
        {
            CreateButton.Hover();
            CancelButton.Click();
            _createVersion.WaitForCSSAnimation();
        }
    }
}
