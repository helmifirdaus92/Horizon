// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.ItemsList;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class WorkflowActionsContextMenu : BaseContextMenu
    {
        public WorkflowActionsContextMenu(WebElement element) : base(element)
        {
        }

        public List<string> GetActionNames()
        {
            return _contextMenu.FindElements("ng-spd-list button").Select(element => element.Text).ToList();
        }

        public WorkflowConfirmationDialog ExecuteAction(string actionName)
        {
            var actionButton = _contextMenu.FindElements("ng-spd-list button").Single(element => element.Text == actionName);
            actionButton.Click();

            var container = _contextMenu.Driver.FindElement("app-workflow-confirmation-dialog");
            return new WorkflowConfirmationDialog(container);
        }
    }
}
