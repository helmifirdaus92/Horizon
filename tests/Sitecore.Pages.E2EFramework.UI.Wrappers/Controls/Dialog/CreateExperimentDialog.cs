// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class CreateExperimentDialog : DialogBase
    {
        public CreateExperimentDialog(IWebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => Container.FindElement(".error-block p").Text;

        private TextBox InputField => Container.FindControl<TextBox>("input");
        public void ClickCancelButton() { ClickActionButton("Cancel"); }
        public void ClickSaveButton() { ClickActionButton("Save"); }

        public CreateExperimentDialog EnterExperimentName(string name)
        {
            InputField.Clear();
            InputField.Text = name;
            return this;
        }
    }
}
