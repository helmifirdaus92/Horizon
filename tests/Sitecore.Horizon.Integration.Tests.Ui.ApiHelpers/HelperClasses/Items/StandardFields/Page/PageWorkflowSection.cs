// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields.Page
{
    public class PageWorkflowSection : WorkflowSection, IPageWorkflowSection
    {
        private const string SampleWorkflowId = DefaultScData.Workflow.SampleWorkflow.WorkflowId;

        public PageWorkflowSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService) : base(contextItemPath, contextDatabase, helperService)
        {
        }

        public new PageWorkflowState GetWorkflowState()
        {
            string stateId = base.GetWorkflowState();
            return GetPageWorkflowStateType(stateId);
        }

        public new PageWorkflowState GetWorkflowState(string language, int version)
        {
            string stateId = base.GetWorkflowState(language, version);
            return GetPageWorkflowStateType(stateId);
        }

        public void SetWorkflowState(PageWorkflowState pageWorkflowState)
        {
            string workflowStateId = GetPageWorkflowStateId(pageWorkflowState);

            SetWorkflowState(SampleWorkflowId, workflowStateId);
        }

        public void SetWorkflowState(PageWorkflowState pageWorkflowState, string language, int version)
        {
            string workflowStateId = GetPageWorkflowStateId(pageWorkflowState);

            SetWorkflowState(SampleWorkflowId, workflowStateId, language, version);
        }

        private string GetPageWorkflowStateId(PageWorkflowState workflowState)
        {
            switch (workflowState)
            {
                case PageWorkflowState.Draft:
                    return DefaultScData.Workflow.SampleWorkflow.WorkflowStateDraft;
                case PageWorkflowState.AwaitingApproval:
                    return DefaultScData.Workflow.SampleWorkflow.WorkflowStateAvaitingApproval;
                case PageWorkflowState.Approved:
                    return DefaultScData.Workflow.SampleWorkflow.WorkflowStateApproved;
                default: return string.Empty;
            }
        }

        private PageWorkflowState GetPageWorkflowStateType(string workflowStateId)
        {
            switch (workflowStateId)
            {
                case DefaultScData.Workflow.SampleWorkflow.WorkflowStateDraft:
                    return PageWorkflowState.Draft;
                case DefaultScData.Workflow.SampleWorkflow.WorkflowStateApproved:
                    return PageWorkflowState.Approved;
                case DefaultScData.Workflow.SampleWorkflow.WorkflowStateAvaitingApproval:
                    return PageWorkflowState.AwaitingApproval;
                default: return PageWorkflowState.Undefined;
            }
        }
    }
}
