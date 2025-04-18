// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TopPanel
{
    public class WorkflowBar
    {
        private WebElement _container;

        private WebElement _actionsButton => _container.FindElement("#workflowActionsBtn");

        public WorkflowBar(WebElement container)
        {
            _container = container;
        }

        public WorkflowActionsContextMenu OpenActionContextMenu()
        {
            _actionsButton.Click();
            _actionsButton.Driver.WaitForHorizonIsStable();
            return new WorkflowActionsContextMenu(_container.Driver.FindElement("ng-spd-popover"));
        }

        public string GetActionsButtonTitle()
        {
            return _actionsButton.GetParent().GetAttribute("title");
        }

        public bool IsActionsButtonDisabled()
        {
            return _actionsButton.HasAttribute("disabled");
        }

        public bool IsActionsUpdating()
        {
            return _actionsButton.Text.Contains("Updating");
        }

        public bool HasActionsButton()
        {
            return _container.FindElements("#workflowActionsBtn").Any();
        }

        public bool HasPublishButton()
        {
            return _container.FindElements("app-publish-button").Any();
        }

        public PublishButton GetPublishButton()
        {
            return new PublishButton(_container.FindElement("app-publish-button"));
        }

        public string GetWorkflowBadgeValue()
        {
            return _container.FindElement(".workflow-state-badge").Text;
        }

        public void ExecuteCommand(WorkflowAction state, string comment = null, int stateSwitchingWaitTimeoutMilliseconds = 10000)
        {
            var contextMenu = OpenActionContextMenu();
            var confirmationDialog = contextMenu.ExecuteAction(state.ToString());

            if (!string.IsNullOrEmpty(comment))
            {
                confirmationDialog.EnterComment(comment);
            }

            confirmationDialog.PressSubmit();
            this.WaitForCondition(x => !HasActionsButton() || !IsActionsUpdating(), stateSwitchingWaitTimeoutMilliseconds);
        }
    }
}
