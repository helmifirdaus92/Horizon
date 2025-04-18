// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Exceptions;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Security.AccessControl;
using Sitecore.SecurityModel;
using Sitecore.Workflows;
using Sitecore.Workflows.Simple;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal class HorizonWorkflowManager : IHorizonWorkflowManager
    {
        private readonly ISitecoreContext _scContext;
        private readonly IHorizonItemUtil _horizonItemUtil;
        private readonly IWorkflowFilterer _workflowFilterer;
        private readonly BaseAuthorizationManager _authorizationManager;
        private readonly BaseAccessRightManager _accessRightManager;
        private readonly BaseTranslate _translate;
        private readonly BaseLog _log;
        private readonly BaseSettings _settings;

        public HorizonWorkflowManager(ISitecoreContext scContext,
            IHorizonItemUtil horizonItemUtil,
            IWorkflowFilterer workflowFilterer,
            BaseAuthorizationManager authorizationManager,
            BaseAccessRightManager accessRightManager,
            BaseTranslate translate,
            BaseLog log,
            BaseSettings settings
        )
        {
            _scContext = scContext;
            _horizonItemUtil = horizonItemUtil;
            _workflowFilterer = workflowFilterer;
            _authorizationManager = authorizationManager;
            _accessRightManager = accessRightManager;
            _translate = translate;
            _log = log;
            _settings = settings;
        }

        public ItemWorkflowInfo? GetItemWorkflowInfo(Item item)
        {
            Database db = _scContext.Database;

            IWorkflowProvider provider = db.WorkflowProvider;
            IWorkflow? workflow = provider?.GetWorkflow(item);
            if (workflow == null)
            {
                return null;
            }

            DeviceItem device = _scContext.Device ?? throw new InvalidOperationException("Context device is null");

            WorkflowState? state = workflow.GetState(item);
            if (state == null)
            {
                return null;
            }

            WorkflowCommand[] commands;
            try
            {
                commands = _workflowFilterer.FilterVisibleCommands(workflow.GetCommands(item), item, db);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Cannot filter commands", ex);
            }

            ItemWorkflowInfo result = new();
            result.State = state;
            result.Commands.AddRange(commands);

            FillCanEditWorkflow(result, item, db.GetItem(state.StateID));

            //if user can edit -> check locking on datasources with the same state
            if (result.CanEdit)
            {
                var lockedDataSource = _horizonItemUtil.GetDatasources(item, device)
                    .Where(dataSource => workflow.GetState(dataSource)?.StateID == state.StateID)
                    .FirstOrDefault(dataSource => dataSource.Locking.IsLocked() && !dataSource.Locking.HasLock());

                // if any datasources with the same state are locked
                if (lockedDataSource != null)
                {
                    result.Warnings.Add(new WorkflowError(item.ID, WorkflowErrorCode.SomeDatasourcesAreLocked));
                }
            }

            return result;
        }

        public WorkflowCommandResult ExecuteCommand(string commandId, string? comment, Item item)
        {
            DeviceItem device = _scContext.Device ?? throw new InvalidOperationException("Context device is null");
            var db = _scContext.Database;

            IWorkflowProvider? provider = db.WorkflowProvider;
            IWorkflow? workflow = provider?.GetWorkflow(item);
            if (workflow == null)
            {
                throw new WorkflowCommandException(Texts.THE_ITEM_IS_CURRENTLY_NOT_PART_OF_A_WORKFLOW);
            }

            var cmdItem = db.GetItem(commandId);
            if (cmdItem == null || !_authorizationManager.IsAllowed(cmdItem, _accessRightManager.GetAccessRight(WellknownRights.WorkflowCommandExecute), _scContext.User))
            {
                throw new WorkflowCommandException(_translate.Text(Texts.YOU_CANNOT_EDIT_THIS_ITEM_AS_IT_IS_IN_A_WORKFLOW_STATE_THAT_YOU_DO_NOT_HAVE_WRITE_ACCESS_TO, item.Name));
            }

            WorkflowState originalState = workflow.GetState(item);
            var originalStateItem = db.GetItem(originalState.StateID);
            if (originalStateItem == null || !CanEditItemWorkflow(item, originalStateItem).Item1)
            {
                throw new WorkflowCommandException(_translate.Text(Texts.YOU_CANNOT_EDIT_THIS_ITEM_AS_IT_IS_IN_A_WORKFLOW_STATE_THAT_YOU_DO_NOT_HAVE_WRITE_ACCESS_TO, item.Name));
            }

            var result = TryExecuteCommandForPageItem(commandId, comment, item, workflow);
            if (result.Completed && _settings.GetBoolSetting("Horizon.Workflow.ExecuteForPageDatasourcesOnSameState", false))
            {
                result = TryExecuteCommandForDatasources(device, workflow, item, originalState.StateID, commandId, comment, result);
            }

            return result;
        }

        private WorkflowCommandResult TryExecuteCommandForPageItem(string commandId, string? comment, Item item, IWorkflow workflow)
        {
            WorkflowResult result = TryExecuteCommand(workflow, commandId, comment, item, out bool hasErrorMessage);
            var resultModel = new WorkflowCommandResult(result.NextStateId, item)
            {
                Completed = result.Succeeded,
                Error = hasErrorMessage ? result.Message : null,
                ValidationResult = ParsePageActionRecords(item, result.ActionRecords),
            };

            return resultModel;
        }

        private static PageValidationResult ParsePageActionRecords(Item item, IEnumerable<BaseWorkflowActionRecord> resultActionRecords)
        {
            var itemValidationResult = ConvertValidationRecords(resultActionRecords);
            var targetItemValidation = itemValidationResult.FirstOrDefault(x => x.ItemId == item.ID) ?? new ItemValidationResult(item.DisplayName, item.ID);
            var datasourceValidation = itemValidationResult.Where(x => x.ItemId != item.ID).ToList();

            return new PageValidationResult(targetItemValidation, datasourceValidation, new List<ItemValidationResult>());
        }

        private static List<ItemValidationResult> ConvertValidationRecords(IEnumerable<BaseWorkflowActionRecord> resultActionRecords)
        {
            ValidationRecord ToValidationRecord(ValidationResult validationResult)
            {
                return new ValidationRecord(validationResult.Result.ToString(), validationResult.Title, validationResult.Description, validationResult.Text, validationResult.Errors.ToList());
            }

            var itemValidationResults = new List<ItemValidationResult>();

            foreach (BaseWorkflowActionRecord baseWorkflowActionRecord in resultActionRecords)
            {
                if (baseWorkflowActionRecord is ItemValidationActionRecord itemValidationActionRecord)
                {
                    var item = itemValidationActionRecord.Item;

                    var itemValidationResult = itemValidationResults.FirstOrDefault(x => x.ItemId == item.ID);
                    if (itemValidationResult == null)
                    {
                        itemValidationResult = new ItemValidationResult(item.DisplayName, item.ID);
                        itemValidationResults.Add(itemValidationResult);
                    }

                    itemValidationResult.ItemRulesResult.Add(ToValidationRecord(itemValidationActionRecord.ValidationResult));
                } else if (baseWorkflowActionRecord is FieldValidationActionRecord fieldValidationActionRecord)
                {
                    var item = fieldValidationActionRecord.Item;
                    var field = fieldValidationActionRecord.Field;

                    var itemValidationResult = itemValidationResults.FirstOrDefault(x=>x.ItemId == item.ID);
                    if (itemValidationResult == null)
                    {
                        itemValidationResult = new ItemValidationResult(item.DisplayName, item.ID);
                        itemValidationResults.Add(itemValidationResult);
                    }

                    var fieldResult = itemValidationResult.FieldRulesResult.FirstOrDefault(x => x.FieldItemId == field.ID);
                    if (fieldResult == null)
                    {
                        fieldResult = new FiledValidationResult(field.DisplayName, field.ID, new List<ValidationRecord>());
                        itemValidationResult.FieldRulesResult.Add(fieldResult);
                    }

                    fieldResult.Records.Add(ToValidationRecord(fieldValidationActionRecord.ValidationResult));
                }
            }

            return itemValidationResults;
        }

        private WorkflowCommandResult TryExecuteCommandForDatasources(DeviceItem device, IWorkflow workflow, Item item, string originalStateId, string commandId, string? comment, WorkflowCommandResult resultModel)
        {
            var processedItems = new List<KeyValuePair<Item, string>>{ new (item, originalStateId) };

            var dsCommandResult = new List<WorkflowCommandResult>();

            var (defaultDSs, personalizedDSs) = getDatasourcesOnWorkflowState(workflow, item, device, originalStateId);
            var datasources = defaultDSs.Concat(personalizedDSs).ToList();
            
            var datasourceExecutionFailed = false;

            foreach (var datasource in datasources)
            {
                string dsInitialWorkflowStateId = item[FieldIDs.WorkflowState];

                WorkflowResult dsResult = TryExecuteCommand(workflow, commandId, comment, datasource, out bool hasErrorMessage);
                WorkflowCommandResult commandResult = new(dsResult.NextStateId, datasource)
                {
                    Completed = dsResult.Succeeded,
                    Error = hasErrorMessage ? dsResult.Message : null
                };
                dsCommandResult.Add(commandResult);

                if (dsResult.Succeeded)
                {
                    processedItems.Add(new KeyValuePair<Item, string>(datasource, dsInitialWorkflowStateId));
                }
                else
                {
                    datasourceExecutionFailed = true;
                    resultModel.Completed = false;
                    if (datasources.Contains(datasource))
                    {
                        resultModel.ValidationResult?.DefaultDatasourceItemsResult.AddRange(ConvertValidationRecords(dsResult.ActionRecords));
                    }
                    else
                    {
                        resultModel.ValidationResult?.PersonalizedDatasourceItemsResult.AddRange(ConvertValidationRecords(dsResult.ActionRecords));
                    }
                }
            }

            if (datasourceExecutionFailed)
            {
                dsCommandResult.ForEach(r => r.Completed = false);
                RollbackStateChanges(processedItems);
            }

            resultModel.DatasourcesCommandResult = dsCommandResult;
            return resultModel;
        }

        private (IEnumerable<Item> defaultDSs, IEnumerable<Item> personalizedDSs) getDatasourcesOnWorkflowState(IWorkflow workflow, Item item, DeviceItem device, string stateId)
        {
            var defaultDSs = _horizonItemUtil.GetDefaultDatasources(item, device)
                .Where(ds => workflow.GetState(ds)?.StateID == stateId);
            var personalizedDSs = _horizonItemUtil.GetPersonalizedDatasources(item, device)
                .Where(ds => workflow.GetState(ds)?.StateID == stateId);

            return (defaultDSs, personalizedDSs);
        }

        private static void RollbackStateChanges(List<KeyValuePair<Item, string>> processedItems)
        {
            foreach (var processedItem in processedItems)
            {
                using (new SecurityDisabler())
                {
                    using (new EditContext(processedItem.Key))
                    {
                        processedItem.Key[FieldIDs.WorkflowState] = processedItem.Value;
                    }
                }
            }
        }

        private void FillCanEditWorkflow(ItemWorkflowInfo stateDto, Item item, Item workflowStateItem)
        {
            Assert.ArgumentNotNull(stateDto, nameof(stateDto));
            Assert.ArgumentNotNull(item, nameof(item));
            Assert.ArgumentNotNull(workflowStateItem, nameof(workflowStateItem));

            stateDto.CanEdit = true;
            var (itemCanEdit, itemError) = CanEditItemWorkflow(item, workflowStateItem);
            if (!itemCanEdit)
            {
                stateDto.CanEdit = false;
                stateDto.Warnings.Add(itemError!);
                return;
            }

            // It might be not 100% true, but let's assume that we are supposed to always have commands for non-final workflow steps.
            // Therefore, if current user doesn't see commands - it's just because it doesn't have permissions to see them.
            // Ideally, we should instead check whether commands are present without security.
            if (!_scContext.User.IsAdministrator && !stateDto.State.FinalState && stateDto.Commands.Count == 0)
            {
                stateDto.CanEdit = false;
                stateDto.Warnings.Add(new WorkflowError(workflowStateItem.ID, WorkflowErrorCode.NoAccessRightWorkflowCommandExecute));
                return;
            }
        }

        private (bool, WorkflowError?) CanEditItemWorkflow(Item item, Item workflowStateItem)
        {
            if (item.Locking.IsLocked() && !item.Locking.HasLock())
            {
                // Allow administrator to process items locked by somebody else.
                return (_scContext.User.IsAdministrator, new WorkflowError(item.ID, WorkflowErrorCode.ItemLockedByAnotherUser));
            }

            // CanWrite checks current workflow state write access too
            if (!item.Access.CanWrite())
            {
                // Use authorizationManager to get specific reason, why CanWrite is false
                if (!_authorizationManager.IsAllowed(workflowStateItem, _accessRightManager.GetAccessRight(WellknownRights.WorkflowStateWrite), _scContext.User))
                {
                    return (false, new WorkflowError(workflowStateItem.ID, WorkflowErrorCode.NoAccessRightWorkflowWrite));
                }

                return (false, new WorkflowError(item.ID, WorkflowErrorCode.NoAccessRightItemWrite));
            }

            return (true, default);
        }

        private WorkflowResult TryExecuteCommand(
            IWorkflow workflow,
            string commandId,
            string? comments,
            Item item,
            out bool hasErrorMessage)
        {
            hasErrorMessage = false;

            try
            {
                var result = workflow.Execute(commandId, item, comments, false);

                if (result.Completed && !result.Succeeded)
                {
                    hasErrorMessage = true;
                }

                return result;
            }
#pragma warning disable CA1031 // Do not catch general exception types
            catch (Exception ex)
#pragma warning restore CA1031 // Do not catch general exception types
            {
                _log.Error("Could not execute workflow command.", ex, this);

                hasErrorMessage = true;

                return ex switch
                {
                    WorkflowStateMissingException or TargetInvocationException { InnerException: WorkflowStateMissingException }
                        => new WorkflowResult(false, _translate.Text(Texts.ONE_OR_MORE_ITEMS_COULD_NOT_BE_PROCESSED_AS_THEIR_WORKFLOW_STATE_DOES_NOT_SPECIFY_A_NEXT_STEP)),

                    _ => new WorkflowResult(false, _translate.Text(Texts.TheWorkflowCommandDidNotComplete))
                };
            }
        }
    }
}
