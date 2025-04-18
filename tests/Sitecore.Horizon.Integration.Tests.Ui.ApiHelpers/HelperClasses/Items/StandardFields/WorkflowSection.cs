// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using UTF.HelperWebService;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Items.StandardFields
{
    public class WorkflowSection : IWorkflowSection
    {
        private const string LockField = "__Lock";
        private const string WorkflowStateField = "__Workflow State";
        private const string IsLockedValue = "<r owner=\"sitecore\\";
        private readonly string _contextItemPath;
        private readonly HelperService _helperService;
        private readonly DatabaseType _contextDatabase;

        public WorkflowSection(string contextItemPath, DatabaseType contextDatabase, HelperService helperService)
        {
            _contextItemPath = contextItemPath;
            _helperService = helperService;
            _contextDatabase = contextDatabase;
        }

        public void Unlock()
        {
            _helperService.EditItem(_contextItemPath, LockField, "");
        }

        public void Lock(string user = "Admin")
        {
            LockItem(null, null, user);
        }

        public void Lock(string language, int version, string user = "Admin")
        {
            LockItem(language, version, user);
        }

        public bool IsLocked()
        {
            return _helperService.GetItemFieldValue(_contextItemPath, LockField).Contains(IsLockedValue);
        }

        public bool IsLocked(string language, int version)
        {
            return _helperService.GetFieldVersionValue(_contextItemPath, LockField, language, version).Contains(IsLockedValue);
        }

        public void SetWorkflowState(string workflowId, string workflowStateId)
        {
            SetItemWorkflowState(workflowId, workflowStateId);
        }

        public void SetDefaultWorkflow(string workflowId)
        {
            _helperService.EditItem(_contextItemPath, "__Default workflow", workflowId);
        }

        public void SetWorkflowState(string workflowId, string workflowStateId, string language, int version)
        {
            SetItemWorkflowState(workflowId, workflowStateId, language, version);
        }

        public string GetWorkflowState()
        {
            return _helperService.GetFieldVersionValue(_contextItemPath, WorkflowStateField, "en", 1, (Database)_contextDatabase);
        }

        public string GetWorkflowState(string language, int version)
        {
            return _helperService.GetFieldVersionValue(_contextItemPath, WorkflowStateField, language, version, (Database)_contextDatabase);
        }

        public List<WorkflowHistoryRecord> GetWorkflowHistory(string language = "en", int version = 1)
        {
            var changes = new List<WorkflowHistoryRecord>();
            List<WorkflowRecord> history = _helperService.GetWorkflowHistory(_contextItemPath, language, version, (Database)_contextDatabase).ToList();
            foreach (WorkflowRecord record in history)
            {
                changes.Add(new WorkflowHistoryRecord(record));
            }

            return changes;
        }

        private void LockItem(string language, int? version, string user)
        {
            if (user.StartsWith("sitecore", StringComparison.OrdinalIgnoreCase))
            {
                user = user.ToLower().Replace("sitecore", "").Trim('/').Trim('\\');
            }

            string value = $"<r owner=\"sitecore\\{user}\" date=\"{DateTime.UtcNow.ToString("yyyyMMddTHHmmssZ")}\" />";
            if (language == null || version == null)
            {
                _helperService.EditItem(_contextItemPath, LockField, value);
            }
            else
            {
                _helperService.EditItemVersion(_contextItemPath, language, (int)version, LockField, value);
            }
        }

        private void SetItemWorkflowState(string workflowId, string workflowStateId, string language = null, int? version = null)
        {
            const string stateField = "__Workflow state";
            _helperService.EditItem(_contextItemPath, "__Workflow", workflowId);

            if (language == null || version == null)
            {
                _helperService.EditItem(_contextItemPath, stateField, workflowStateId);
            }
            else
            {
                _helperService.EditItemVersion(_contextItemPath, language, (int)version, stateField, workflowStateId);
            }
        }
    }
}
