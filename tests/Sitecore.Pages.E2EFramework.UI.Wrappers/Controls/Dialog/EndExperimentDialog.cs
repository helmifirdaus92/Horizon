// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class EndExperimentDialog : DialogBase
    {
        public EndExperimentDialog(IWebElement container) : base(container)
        {
        }
        private List<IWebElement> Variants => Container.FindElements(".variant-option").ToList();

        public EndExperimentDialog SelectVariantByName(string variantName)
        {
            var variant = Variants.Find(v => v.FindElement("label").Text.Contains(variantName));
            if (variant != null)
            {
                variant.FindElement("input").Click();
            }
            else
            {
                Logger.Write($"Variant with name {variantName} is not visible in the UI");
            }
            Container.GetDriver().WaitForHorizonIsStable();
            return this;
        }

        public void ClickCancelButton() { ClickActionButton("Cancel"); }

        public void ClickSaveButton() { ClickActionButton("Save"); }
    }
}
