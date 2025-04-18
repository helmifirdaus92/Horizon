// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class DuplicateDialog : DialogBase
    {
        public DuplicateDialog(IWebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => Container.FindElement(".error-block p").Text;
        private TextBox InputField => Container.FindControl<TextBox>("input");
        public void ClickCancelButton() { ClickActionButton("Cancel"); }

        public void ClickDuplicateButton()
        {
            ClickActionButton("Duplicate");
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public DuplicateDialog EnterItemName(string name)
        {
            InputField.Clear();
            InputField.Text = name;
            return this;
        }
    }
}
