// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.E2E.Test.Framework.Controls;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.RightHandPanel
{
    public class OrchestratorSectionAccordion : Accordion
    {
        public OrchestratorSectionAccordion(IWebElement section) : base(section)
        {
        }

        private IWebElement AlignContentCenterElement => Container.FindElement(".sxa-button-wrapper button[title = 'Align content center']");

        private Button AlignContentCenter => new Button(AlignContentCenterElement);

        public void ClickAlignContentCenter()
        {
            Logger.Write("==> DEBUG AlignContentCenter.Click();");

            AlignContentCenter.Container.ScrollIntoView();
            AlignContentCenter.Click();

            Logger.Write("==> DEBUG Clicked;");

        }
    }
}


