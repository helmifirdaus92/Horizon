// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class ConfirmationDialog : DialogBase
{
    public ConfirmationDialog(IWebElement container) : base(container)
    {
    }

    public string Title => Container.FindElement(By.CssSelector("app-warning-dialog ng-spd-dialog-header")).Text;
    public string Message => Container.FindElement(By.CssSelector("app-warning-dialog ng-spd-dialog-content")).Text;
    public void ClickDeleteButton() { ClickActionButton("Delete"); }
    public void ClickRejectButton() { ClickActionButton("Cancel"); }
    public void ClickOverwriteButton() { ClickActionButton("Overwrite"); }
}
