// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class DeleteDialog : DialogBase
    {
        public string Message => Container.FindElement("ng-spd-dialog-content").Text;
        public DeleteDialog(IWebElement container) : base(container)
        {
        }

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
