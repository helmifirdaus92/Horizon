// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;

public class RawContentItem
{
    public List<Item> ancestors { get; set; }
    public List<RawContentItem> children { get; set; }
    public string createdBy { get; set; }
    public string creationDate { get; set; }
    public string displayName { get; set; }
    public bool hasChildren { get; set; }
    public string icon { get; set; }
    public string id { get; set; }
    public List<InsertOption> insertOptions { get; set; }
    public bool isFolder { get; set; }
    public bool isLatestPublishableVersion { get; set; }
    public string language { get; set; }
    public ContentItemLocking locking { get; set; }
    public string name { get; set; }
    public RawContentItem parent { get; set; }
    public string parentId { get; set; }
    public string path { get; set; }
    public ContentItemPermissions permissions { get; set; }
    public ContentItemPublishing publishing { get; set; }
    public string revision { get; set; }
    public Template template { get; set; }
    public string updatedBy { get; set; }
    public string updatedDate { get; set; }
    public string url { get; set; }
    public int version { get; set; }
    public string versionName { get; set; }
    public List<Item> versions { get; set; }
    public WorkflowState workflow { get; set; }
}
