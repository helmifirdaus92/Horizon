// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

public class GetMediaFolderItemResponse
{
    public MediaFolderItem mediaFolderItem { get; set; }
}

public class MediaFolderItem
{
    public List<MediaFolderItem> children { get; set; }
    public string displayName { get; set; }
    public bool hasChildren { get; set; }
    public string id { get; set; }
    public string parentId { get; set; }
    public MediaItemPermissions permissions { get; set; }
}

public class MediaItemPermissions
{
    public bool canCreate { get; set; }
    public bool canDelete { get; set; }
    public bool canRename { get; set; }
}
