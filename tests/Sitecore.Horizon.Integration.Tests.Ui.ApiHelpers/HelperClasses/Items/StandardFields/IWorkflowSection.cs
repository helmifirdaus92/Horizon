// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public interface IWorkflowSection
    {
        void Unlock();
        void Lock(string user = "Admin");
        void Lock(string language, int version, string user = "Admin");

        bool IsLocked();
        bool IsLocked(string language, int version);

        void SetWorkflowState(string workflowId, string workflowStateId);
        void SetWorkflowState(string workflowId, string workflowStateId, string language, int version);
        void SetDefaultWorkflow(string workflowId);
        string GetWorkflowState();
        string GetWorkflowState(string language, int version);

        List<WorkflowHistoryRecord> GetWorkflowHistory(string language = "en", int version = 1);
    }
}
