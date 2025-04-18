// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components
{
    public class ConfirmationDialogPanel
    {
        private readonly WebElement _confirmationDialog;
        private readonly List<WebElement> _actions;

        public ConfirmationDialogPanel(BrowserWrapper browser)
        {
            _confirmationDialog = browser.FindElement("app-warning-dialog");
            _actions = _confirmationDialog.FindElements("app-warning-dialog ng-spd-dialog-actions button").ToList();
        }

        public string Title => _confirmationDialog.FindElement("app-warning-dialog ng-spd-dialog-header").Text;
        public string Message => _confirmationDialog.FindElement("app-warning-dialog ng-spd-dialog-content").Text;

        public void Confirm(string text = "Delete")
        {
            _actions.Find(action => action.Text.Contains(text)).Click();
            _confirmationDialog.Driver.WaitForHorizonIsStable();
        }

        public void Reject(string text = "Cancel")
        {
            _actions.Find(action => action.Text.Contains(text)).Click();
            _confirmationDialog.Driver.WaitForHorizonIsStable();
        }
    }
}
