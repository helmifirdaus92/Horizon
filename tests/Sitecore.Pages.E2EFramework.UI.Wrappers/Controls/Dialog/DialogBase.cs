// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls.Dialog
{
    public class DialogBase : BaseControl
    {
        public DialogBase(IWebElement container) : base(container)
        {
        }

        public List<IWebElement> Buttons => Container.FindElements("ng-spd-dialog-actions button").ToList();
        public string HeaderText => Container.FindElement("ng-spd-dialog-header").Text;
        public string ActiveStep => Container.FindElement("app-stepper .steps.active .text").Text;
        private IWebElement _closeDialogButton => Container.FindElement("ng-spd-dialog-close-button button");

        public void Close()
        {
            _closeDialogButton.Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        protected void ClickActionButton(string buttonText)
        {
            Buttons
                .First(element => element.Text == buttonText)
                .Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }

        protected void ClickActionButton(int index)
        {
            Container.FindElements("ng-spd-dialog-actions button")[index].Click();
            Container.GetDriver().WaitForHorizonIsStable();
        }


        protected void WaitForDialogToDisappear()
        {
            Container.GetDriver().WaitForHorizonIsStable();
            bool elementExists = Container.GetDriver().CheckElementExists(Constants.DialogPanelLocator);
            if (elementExists)
            {
                Container.GetDriver().WaitForCondition(d =>
                {
                    var elementIsVisible = Container.GetDriver().CheckElementExists(Constants.DialogPanelLocator);
                    Logger.Write($"Element is visible...: {elementIsVisible}");
                    return !elementIsVisible;
                });
            }
            Container.GetDriver().WaitForHorizonIsStable();
            Container.GetDriver().WaitForNetworkCalls();
        }
    }

    public enum Action
    {
        Delete,
        Cancel,
        Create,
        Next,
        Duplicate,
        Save,
        Dismiss

    }

}
