// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class WorkflowConfirmationDialog : DialogBase
{
    public WorkflowConfirmationDialog(IWebElement container) : base(container)
    {
    }

    private IWebElement _commentTextBox => Container.FindElement(".confirm-dialog textarea");

    public void Submit() { ClickActionButton("Submit"); }

    public void SubmitWithComment(string commentText)
    {
        _commentTextBox.SendKeys(commentText);
        ClickActionButton("Submit");
    }
    public void Cancel() { ClickActionButton("Cancel"); }
}
