// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout
{
    public class ChipElement : BaseControl
    {
        public ChipElement(IWebElement container) : base(container)
        {
        }

        private IWebElement FindChipIconElement => Container.FindElement("button[title='Select parent element']");
        private IWebElement SelectContentItem => Container.FindElement("button[title='Select content item']");
        private IWebElement DeleteButton => Container.FindElement("button[title='Delete']");
        private IWebElement OpenInExplorerButton => Container.FindElement("button[title='Open in Explorer']");
        private IWebElement ABnTestComponent => Container.FindElement("button[title*='A/B/n test']");
        private IWebElement _name => Container.FindElement("[class*=text]");
        public string Name=>_name.Text;

        public IWebElement DragVertical => Container.FindElement("[class*=drag-vertical]");

        public void MoveRenderingUp() => Container.FindElement("[class*='arrow-up']:not([class*='arrow-up-left'])").Click();
        public void MoveRenderingDown() => Container.FindElement("[class*='arrow-down']").Click();

        public void NavigateUp()
        {
            var iconElement = FindChipIconElement;
            iconElement.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public bool IsDeleteButtonEnabled()
        {
            return DeleteButton.Enabled;
        }

        public bool IsDeleteButtonDisplayed()
        {
            return DeleteButton.Displayed;
        }

        public bool IsBrowseDataSourceEnabled()
        {
            return SelectContentItem.Enabled;
        }

        public bool IsABnTestComponentEnabled()
        {
            return ABnTestComponent.Enabled;
        }

        public void DeleteElement()
        {
            DeleteButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void DeleteElementViaKey()
        {
            Container.SendKeys(Keys.Delete);
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public void OpenInExplorer()
        {
            OpenInExplorerButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        public CreateExperimentDialog OpenCreateExperimentDialog()
        {
            ABnTestComponent.Click();
            Container.GetDriver().WaitForHorizonIsStable();
            Container.GetDriver().SwitchTo().DefaultContent();
            return new CreateExperimentDialog(Container.GetDriver().FindElement("app-create-experiment-dialog"));
        }

        public bool IsABnTestComponentDisabled()
        {
            return ABnTestComponent.GetAttribute("style").Equals("opacity: 0.3;");
        }
    }
}
