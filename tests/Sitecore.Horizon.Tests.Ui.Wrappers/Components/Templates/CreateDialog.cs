// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public class CreateDialog : DialogBase
    {
        public CreateDialog(WebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => _dialog.FindElement(".error-block p").Text;

        private WebElement InputField => _dialog.FindElement("input");
        public void ClickCancelButton() { ClickActionButton("Cancel"); }
        public void ClickCreateButton() { ClickActionButton("Create"); }

        public void EnterItemName(string name)
        {
            InputField.Clear();
            InputField.TypeKeys(name);
        }
    }
}
