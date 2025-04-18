// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework.Controls;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class AddPhoneNumberDialog : DialogBase
{
    public AddPhoneNumberDialog(IWebElement container) : base(container)
    {
    }

    private TextBox InputField => Container.FindControl<TextBox>("input");

    public void ClickCancelButton() { ClickActionButton("Cancel"); }
    public void ClickSaveButton() { ClickActionButton("Save"); }

    public AddPhoneNumberDialog EnterPhoneNumber(string phoneNumber)
    {
        InputField.Clear();
        InputField.Text = phoneNumber;
        return this;
    }
}
