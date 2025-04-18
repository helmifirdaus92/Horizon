// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class StartTestCheckList : BaseControl
    {
        public StartTestCheckList(IWebElement container) : base(container)
        {
        }

        public List<string> GetChecklistItems()
        {
            var checklistItems = Container.FindElements(".list p");
            return checklistItems.Select(item => item.Text).ToList();
        }

        public void ClickOkButton()
        {
            Container.FindElement("button.outlined").Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void ClickContinueButton()
        {
            Container.FindElement("button.primary").Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
