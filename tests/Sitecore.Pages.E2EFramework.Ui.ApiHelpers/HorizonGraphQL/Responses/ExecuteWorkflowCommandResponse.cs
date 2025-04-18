// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class ExecuteWorkflowCommandResponse
{
    public ExecuteWorkflowCommandPayload executeWorkflowCommand { get; set; }
}

public class ExecuteWorkflowCommandPayload
{
    public bool completed { get; set; }
    public ExecuteWorkflowCommandResponse[] datasourcesCommandResult { get; set; }
    public string error { get; set; }
    public Item item { get; set; }
    public string nextStateId { get; set; }
    public ValidationResult pageWorkflowValidationResult { get; set; }
}

public class ValidationResult
{
    public ItemValidationResult[] defaultDatasourceItemsResult { get; set; }
    public ItemValidationResult pageItemResult { get; set; }
    public ItemValidationResult[] personalizedDatasourceItemsResult { get; set; }
}

public class ItemValidationResult
{
    public FieldValidationResult[] fieldRulesResult { get; set; }
    public string itemId { get; set; }
    public string itemName { get; set; }
    public ItemValidationRecord itemRulesResult { get; set; }
}

public class FieldValidationResult
{
    public string fieldItemId { get; set; }
    public string fieldName { get; set; }
    public ItemValidationRecord[] records { get; set; }
}

public class ItemValidationRecord
{
    public string[] errors { get; set; }
    public string validatorDescription { get; set; }
    public string validatorResult { get; set; }
    public string validatorText { get; set;}
    public string validatorTitle { get; set; }
}
