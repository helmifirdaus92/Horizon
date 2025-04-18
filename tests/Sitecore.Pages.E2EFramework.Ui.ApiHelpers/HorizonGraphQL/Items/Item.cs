// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

public class Item
{
    public List<Item> ancestors { get; set; }
    public List<Item> children { get; set; }
    public string createdBy { get; set; }
    public string creationDate { get; set; }
    public string displayName { get; set; }
    public bool hasChildren { get; set; }
    public string icon { get; set; }
    public string id { get; set; }
    public List<InsertOption> insertOptions { get; set; }
    public bool isLatestPublishableVersion { get; set; }
    public string language { get; set; }
    public ContentItemLocking locking { get; set; }
    public string name { get; set; }
    public Item parent { get; set; }
    public string path { get; set; }
    public ContentItemPermissions permissions { get; set; }
    public ContentItemPublishing publishing { get; set; }
    public string revision { get; set; }
    public Template template { get; set; }
    public string updatedBy { get; set; }
    public string updatedDate { get; set; }
    public int version { get; set; }
    public string versionName { get; set; }
    public List<Item> versions { get; set; }
    public WorkflowState workflow { get; set; }
    public List<Item> ancestorsWithSiblings { get; set; }
    public bool isFolder { get; set; }
    public string parentId { get; set; }
    public string presentationDetails { get; set; }
    public string layoutEditingKind { get; set; }
}

public class InsertOption
{
    public string displayName { set; get; }
    public string id { set; get; }
}

public class ContentItemLocking
{
    public bool canUnlock { get; set; }
    public bool isLocked { get; set; }
    public string lockedBy { get; set; }
    public bool lockedByCurrentUser { get; set; }
}

public class ContentItemPermissions
{
    public bool canCreate { get; set; }
    public bool canDelete { get; set;}
    public bool canPublish { get; set;}
    public bool canRename { get; set;}
    public bool canWrite { get; set;}
}

public class ContentItemPublishing
{
    public bool hasPublishableVersion { get; set; }
    public bool isAvailableToPublish { get; set; }
    public bool isPublishable { get; set; }
    public string validFromDate { get; set; }
    public string validToDate { get; set; }
}

public class WorkflowState
{
    public bool canEdit { get; set; }
    public WorkflowCommand[] commands { get; set; }
    public string displayName { get; set; }
    public bool finalState { get; set; }
    public string icon { get; set; }
    public string id { get; set; }
    public WorkflowError[] warnings { get; set; }
}

public class WorkflowCommand
{
    public string displayName { get; set; }
    public bool hasUI { get; set; }
    public string icon { get; set; }
    public string id { get; set; }
    public bool suppressComment { get; set; }
}

public class WorkflowError
{
    public string errorCode { get; set; }
    public string id { get; set; }
    public string message { get; set; }
}
