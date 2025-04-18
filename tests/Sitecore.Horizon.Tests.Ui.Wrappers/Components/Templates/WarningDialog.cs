// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class WarningDialog : DialogBase
    {
        public WarningDialog(WebElement container) : base(container)
        {
        }

        public string ContentMessage => _dialog.FindElement("ng-spd-dialog-content").Text;

        public void ClickCancelButton()
        {
            ClickActionButton("Cancel");
            WaitForDialogToDisappear();
        }

        public void ClickPrimaryActionButton()
        {
            ClickActionButton(1);
            WaitForDialogToDisappear();
        }
    }
}
