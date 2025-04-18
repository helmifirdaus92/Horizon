// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable disable warnings

using System.Collections.Generic;
using Sitecore.Data;
using Sitecore.Data.Items;

namespace Sitecore.Horizon.Integration.Items.Workflow
{
    internal record WorkflowCommandResult(ID NextStateId, Item Item)
    {
        public bool Completed { get; set; } = false;
        
        public string? Error { get; set; }

        public PageValidationResult? ValidationResult { get; set; }

        public IEnumerable<WorkflowCommandResult>? DatasourcesCommandResult { get; set; }
    }

    internal record PageValidationResult(ItemValidationResult PageItemResult, List<ItemValidationResult> DefaultDatasourceItemsResult, List<ItemValidationResult> PersonalizedDatasourceItemsResult)
    {
    }

    internal record ItemValidationResult(string ItemName, ID ItemId)
    {
        public List<ValidationRecord> ItemRulesResult = new();
        public List<FiledValidationResult> FieldRulesResult = new();
    }

    internal record FiledValidationResult(string FieldName, ID FieldItemId, List<ValidationRecord> Records)
    {
    }

    internal record ValidationRecord(string ValidatorResult, string ValidatorTitle, string ValidatorDescription, string ValidatorText, List<string> Errors)
    {
    }
}
