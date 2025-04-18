// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.LeftPanel
{
    public class RenameItemDialog
    {
        private WebElement _renameItemDialog;

        public RenameItemDialog(WebElement renameItemDialog)
        {
            _renameItemDialog = renameItemDialog;
        }

        private WebElement _itemNameInput => _renameItemDialog.FindElement("#itemName");
        private WebElement _displayNameInput => _renameItemDialog.FindElement("#displayName");

        private WebElement _closeButton => _renameItemDialog.FindElement("ng-spd-dialog-close-button button");

        private WebElement _renameButton => _renameItemDialog.FindElement("button.md.primary");
        private WebElement _cancelButton => _renameItemDialog.FindElement("button.md.rounded");

        public void ChangeItemName(string newName)
        {
            _itemNameInput.Clear();
            _itemNameInput.TypeKeys(newName);
            _renameItemDialog.Driver.WaitForHorizonIsStable();
        }

        public void ChangeDisplayName(string newDisplayName)
        {
            _displayNameInput.Clear();
            _displayNameInput.TypeKeys(newDisplayName);
            _renameItemDialog.Driver.WaitForHorizonIsStable();
        }

        public void Rename()
        {
            _renameButton.Click();
            _renameItemDialog.Driver.WaitForHorizonIsStable();
        }

        public void Cancel()
        {
            _cancelButton.Click();
        }

        public void CloseDialog()
        {
            _closeButton.Click();
        }
    }
}
