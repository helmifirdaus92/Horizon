// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.RightPanel
{
    public class ItemInfoPanel
    {
        private readonly WebElement _container;

        public ItemInfoPanel(WebElement container)
        {
            _container = container;
        }

        public Guid ItemId => Guid.Parse(GetItemParameterText("Item ID"));

        public string ItemName => GetItemParameterText("Item name");
        public PageWorkflowState WorkflowState => GetPageWorkflowStateType(GetItemParameterText("Workflow state"));
        public string ItemPath => GetItemParameterText("Item path");
        public string CreatedBy => GetItemParameterText("Created by");
        public DateTime CreationDate => DateTime.Parse(GetItemParameterText("Created"));
        public string TemplatePath => GetItemParameterText("Template path");

        private string GetItemParameterText(string propertyName)
        {
            _container.WaitForCondition(props => _container.FindElements("app-rhs-property > h4").Any(x => x.Text.Equals(propertyName)));

            var properties = _container.FindElements("app-rhs-property > h4");

            return properties.First(el => el.Text.Equals(propertyName)).GetNextSibling().Text;
        }

        private PageWorkflowState GetPageWorkflowStateType(string workflowStateName)
        {
            workflowStateName = workflowStateName.Replace(" ", "");
            return !Enum.TryParse(workflowStateName, out PageWorkflowState workflowState) ? PageWorkflowState.Undefined : workflowState;
        }
    }
}
