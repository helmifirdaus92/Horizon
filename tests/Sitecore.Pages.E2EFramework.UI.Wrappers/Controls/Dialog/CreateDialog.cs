// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class CreateDialog : DialogBase
    {
        public CreateDialog(IWebElement container) : base(container)
        {
        }

        public string ValidationErrorMsg => Container.FindElement(".error-block p").Text;

        private TextBox InputField => Container.FindControl<TextBox>("input");
        public void ClickCancelButton() { ClickActionButton("Cancel"); }
        public void ClickCreateButton() { ClickActionButton("Create"); }
        public void ClickNextButton() { ClickActionButton("Next"); }
        private IWebElement SaveAudienceButton => Container.FindElement(".disconnected + button");

        public CreateDialog EnterItemName(string name)
        {
            InputField.Clear();
            InputField.Text = name;
            return this;
        }

        public void CreateNewVariant(string variantName)
        {
            EnterItemName(variantName);
            ClickNextButton();
            InputField.Text = (variantName + "_audience");
            SaveAudienceButton.Click();
        }
    }
}
