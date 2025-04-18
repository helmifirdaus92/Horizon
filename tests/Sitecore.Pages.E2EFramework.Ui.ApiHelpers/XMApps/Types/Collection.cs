// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types;

public class Collection
{
    public string id { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public string displayName { get; set; }
    public int sortOrder { get; set; }
    public string createdBy { get; set; }
    public DateTime created { get; set; }
    public Permissions permissions { get; set; }
    public Settings settings { get; set; }
    
    public class Settings
    {
        public string itemPath { get; set; }
    }
    public class Permissions
    {
        public bool canAdmin { get; set; }
        public bool canWrite { get; set; }
        public bool canCreate { get; set; }
        public bool canDelete { get; set; }
        public bool canRename { get; set; }
        public bool canRead { get; set; }
        public bool canPublish { get; set; }
        public bool canDuplicate { get; set; }
    }
}

