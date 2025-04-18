// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class DeleteDialog : DialogBase
    {
        public DeleteDialog(WebElement container) : base(container)
        {
        }

        public string ContentMessage => _dialog.FindElement("ng-spd-dialog-content .content").Text;

        public void ClickCancelButton()
        {
            ClickActionButton("Cancel");
            WaitForDialogToDisappear();
        }

        public void ClickDeleteButton()
        {
            ClickActionButton("Delete");
            WaitForDialogToDisappear();
        }
    }
}
