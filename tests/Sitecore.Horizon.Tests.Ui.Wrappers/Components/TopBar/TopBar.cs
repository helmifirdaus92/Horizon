// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopBar
{
    public class TopBar
    {
        private readonly WebElement _topBar;

        public TopBar(WebElement topBar)
        {
            _topBar = topBar;
        }

        private WebElement PageInfo => _topBar.FindElement("div.page-info.ng-star-inserted");
        public SavedIndicator SavedIndicator => new SavedIndicator(_topBar.FindElement("ng-spd-saved-indicator i"));
        private WebElement UndoControl => _topBar.FindElement("button[title='Undo']");
        private WebElement RedoControl => _topBar.FindElement("button[title='Redo']");

        public bool UndoEnabled => IsControlEnabled(UndoControl);
        public bool RedoEnabled => IsControlEnabled(RedoControl);

        private bool IsControlEnabled(WebElement control)
        {
            return !control.HasAttribute("disabled");
        }

        private void NavigateByHistory(WebElement control)
        {
            control.WaitForCondition(IsControlEnabled, 2000);

            control.Click();
            control.Driver.WaitForHorizonIsStable();
        }
        public void Undo()
        {
            NavigateByHistory(UndoControl);
        }

        public void Redo()
        {
            NavigateByHistory(RedoControl);
        }


    }
}
