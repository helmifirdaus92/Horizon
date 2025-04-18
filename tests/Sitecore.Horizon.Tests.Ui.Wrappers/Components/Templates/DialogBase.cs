// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using OpenQA.Selenium;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.Templates
{
    public abstract class DialogBase
    {
        protected readonly WebElement _dialog;

        protected DialogBase(WebElement container)
        {
            _dialog = container;
        }

        public bool IsDisplayed => _dialog.Displayed;
        public List<WebElement> Buttons => _dialog.FindElements("ng-spd-dialog-actions button").ToList();
        protected void ClickActionButton(string buttonText)
        {
            Buttons
                .First(element => element.Text == buttonText)
                .Click();
            _dialog.Driver.WaitForHorizonIsStable();
        }

        protected void ClickActionButton(int index)
        {
            _dialog.FindElements("ng-spd-dialog-actions button")[index].Click();
            _dialog.Driver.WaitForHorizonIsStable();
        }


        protected void WaitForDialogToDisappear()
        {
            _dialog.Driver.WaitForHorizonIsStable();
            bool elementExists = _dialog.Driver.CheckElementExists("ng-spd-dialog-panel");
            if (elementExists)
            {
                _dialog.Driver.WaitForCondition(d =>
                {
                    var elementIsVisible = _dialog.Driver.CheckElementExists("ng-spd-dialog-panel");
                    Logger.WriteLine($"Element is visible...: {elementIsVisible}");
                    return !elementIsVisible;
                });
            }
            _dialog.Driver.WaitForHorizonIsStable();
            _dialog.Driver.WaitForNetworkCalls();
        }
    }
}
