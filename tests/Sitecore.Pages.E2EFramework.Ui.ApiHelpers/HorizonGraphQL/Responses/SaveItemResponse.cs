// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class SaveItemResponse
{
    public SaveItemPayload saveItem { get; set; }
}

public class SaveItemPayload
{
    public SaveItemError[] errors { get; set; }
    public ItemVersionInfo[] newCreatedVersions { get; set; }
    public SavedItem[] savedItems { get; set; }
    public ValidationError[] validationError { get; set; }
    public string[] warnings { get; set; }
}

public class SavedItem
{
    public SavedItemField[] fields { get; set; }
    public string id { get; set; }
    public string language { get; set; }
    public string revision { get; set; }
    public int version { get; set; }
}

public class SavedItemField
{
    public string id { get; set; }
    public string originalValue { get; set; }
    public string value { get; set; }
}

public class SaveItemError
{
    public string errorCode { get; set; }
    public string message { get; set; }
    public string itemId { get; set; }
}

public class ItemVersionInfo
{
    public string displayName { get; set; }
    public string itemId { get; set; }
    public int versionNumber { get; set; }
}

public class ValidationError
{
    public string aborted { get; set; }
    public string errorLevel { get; set; }
    public string errorMessage { get; set; }
    public string fieldId { get; set; }
}
