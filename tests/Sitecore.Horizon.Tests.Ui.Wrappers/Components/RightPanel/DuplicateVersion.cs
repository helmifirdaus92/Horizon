// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class DuplicateVersion
    {
        private readonly WebElement _duplicateVersion;

        public DuplicateVersion(WebElement renameVersion)
        {
            _duplicateVersion = renameVersion;
        }

        public WebElement Header => _duplicateVersion.FindElement("h4");
        public WebElement VersionName => _duplicateVersion.FindElement("input");
        public WebElement CancelButton => _duplicateVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(1)");
        public WebElement DuplicateButton => _duplicateVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(2)");


        public void Duplicate(string name = null)
        {
            if (name != null)
            {
                VersionName.SendKeys(name);
            }

            DuplicateButton.Click();
            _duplicateVersion.WaitForCSSAnimation();
        }

        public void Cancel()
        {
            CancelButton.Click();
            _duplicateVersion.WaitForCSSAnimation();
        }
    }
}
