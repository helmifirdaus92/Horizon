// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TopBar
{
    public class PublishButtonList : BaseControl
    {
        public PublishButtonList(IWebElement container, params object[] parameters) : base(container, parameters)
        {
        }

        private IWebElement PagesCheckBoxElement => Container.FindElement("#publish-page");
        private IWebElement SubPagesCheckBoxElement => Container.FindElement("#publish-subpages");
        private IWebElement AllLanguagesCheckBoxElement => Container.FindElement("#publish-languages");

        private IWebElement StartPublishButton => Container.FindElement(".publish");

        public void ClickStartPublishButton()
        {
            StartPublishButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void SetSubPagesCheckBox()
        {
            if (SubPagesCheckBoxElement.GetAttribute("class").Contains("checked"))
            {
                return;
            }

            SubPagesCheckBoxElement.Click();
            Container.GetDriver().WaitForHorizonIsStable();

        }

        public void SetAllLanguagesCheckBox()
        {
            if (AllLanguagesCheckBoxElement.GetAttribute("class").Contains("checked"))
            {
                return;
            }

            AllLanguagesCheckBoxElement.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }
    }
}
