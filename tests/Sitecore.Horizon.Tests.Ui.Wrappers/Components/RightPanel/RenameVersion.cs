// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class RenameVersion
    {
        private readonly WebElement _renameVersion;

        public RenameVersion(WebElement renameVersion)
        {
            _renameVersion = renameVersion;
        }

        public WebElement Header => _renameVersion.FindElement("h4");
        public WebElement VersionName => _renameVersion.FindElement("input");
        public WebElement AssignedWorkflowState => _renameVersion.FindElement("p");
        public WebElement CancelButton => _renameVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(1)");
        public WebElement RenameButton => _renameVersion.FindElement("ng-spd-dialog-actions button:nth-of-type(2)");
        public void Rename(string name = null)
        {
            if (name != null)
            {
                VersionName.SendKeys(name);
            }

            RenameButton.Click();
            _renameVersion.WaitForCSSAnimation();
        }

        public void Cancel()
        {
            CancelButton.Click();
            _renameVersion.WaitForCSSAnimation();
        }
    }
}
