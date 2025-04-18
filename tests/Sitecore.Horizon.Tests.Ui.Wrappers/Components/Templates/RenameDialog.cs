// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class RenameDialog : DialogBase
    {
        public RenameDialog(WebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => _dialog.FindElement(".error-block p").Text;

        private WebElement InputField => _dialog.FindElement("input");
        public bool SaveEnabled => Buttons.First(b=>b.Text.Equals("Save")).Enabled;

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

        public void EnterItemName(string name)
        {
            InputField.Clear();
            InputField.TypeKeys(name);
        }
    }
}
