// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

public class RenameDialog : DialogBase
{
    public RenameDialog(IWebElement container) : base(container)
    {
    }

    public bool IsDisplayed => Container.Displayed;
    public string ValidationErrorMsg => Container.FindElement(".error-block p").Text;

    public bool SaveEnabled => Buttons.First(b => b.Text.Equals("Save")).Enabled;
    public bool RenameEnabled => Buttons.First(b => b.Text.Equals("Rename")).Enabled;
    public bool CancelEnabled => Buttons.First(b => b.Text.Equals("Cancel")).Enabled;

    private TextBox InputField => Container.FindControl<TextBox>("input");

    private TextBox ItemNameInput => Container.FindControl<TextBox>("#itemName");
    private TextBox DisplayNameInput => Container.FindControl<TextBox>("#displayName");

    public void ClickCancelButton()
    {
        ClickActionButton("Cancel");
        WaitForDialogToDisappear();
    }

    public void ClickSaveButton()
    {
        ClickActionButton("Save");
        WaitForDialogToDisappear();
    }

    public void ClickSaveButtonWithoutWaiting()
    {
        ClickActionButton("Save");
    }

    public void ClickRenameButton()
    {
        ClickActionButton("Rename");
        WaitForDialogToDisappear();
    }

    public RenameDialog EnterItemName(string name)
    {
        InputField.Clear();
        InputField.Text = name;
        return this;
    }

    public RenameDialog ChangeItemName(string newName)
    {
        ItemNameInput.Clear();
        ItemNameInput.Text = newName;
        return this;
    }

    public RenameDialog ChangeDisplayName(string newDisplayName)
    {
        DisplayNameInput.Clear();
        DisplayNameInput.Text = newDisplayName;
        return this;
    }
}
