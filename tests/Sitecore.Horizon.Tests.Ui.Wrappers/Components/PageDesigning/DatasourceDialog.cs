// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.PageDesigning
{
    public class DatasourceDialog
    {
        private WebElement _dialogControl;

        public DatasourceDialog(WebElement container)
        {
            _dialogControl = container;
        }

        public ItemsTree DatasourceItemTree => new ItemsTree(_dialogControl.FindElement("app-datasource-picker"), canvasReloadWaitMethod: null);

        public CreateContentItemSlidingPanel ContentItemSlidingPanel => new CreateContentItemSlidingPanel(_dialogControl);

        private WebElement _cancelButton => _dialogControl.FindElement("ng-spd-dialog-actions>button");
        private WebElement _assignButton => _dialogControl.FindElement("ng-spd-dialog-actions button[ngspdbutton = 'primary']");
        private WebElement _createContentItemButton => _dialogControl.FindElement("app-datasource-picker button[ngspdbutton = 'sliding']");

        public bool IsCancelButtonEnabled()
        {
            return _cancelButton.Enabled;
        }

        public bool IsAssignButtonEnabled()
        {
            return _assignButton.Enabled;
        }

        public void Cancel()
        {
            _cancelButton.Click();
            _cancelButton.Driver.WaitForHorizonIsStable();
        }

        public void Assign()
        {
            _assignButton.Click();
            _assignButton.Driver.WaitForHorizonIsStable();
        }

        public CreateContentItemSlidingPanel InvokeCreateItemSlidingPanel()
        {
            _createContentItemButton.Click();
            _createContentItemButton.Driver.WaitForHorizonIsStable();
            return ContentItemSlidingPanel; 
        }

        public TimedNotification.TimedNotification GetAllTimedNotifications()
        {
            WebElement element = _dialogControl.FindElement("ng-spd-timed-notification");
            return new TimedNotification.TimedNotification(element);
        }
    }
}
