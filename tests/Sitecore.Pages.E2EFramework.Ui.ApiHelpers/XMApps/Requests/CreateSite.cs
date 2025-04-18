// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Requests;

public class CreateSite
{
    public string siteName { get; set; }
    public string displayName { get; set; }
    public string templateId { get; set; }
    public string collectionId { get; set; }
    public string language { get; set; }
    public List<string> languages { get; set; }
    public string hostName { get; set; }
    public string description { get; set; }
    public string collectionName { get; set; }
    public string collectionDisplayName { get; set; }
    public string collectionDescription { get; set; }
    public List<PosMapping> posMappings { get; set; }

    public class PosMapping
    {
        public string name { get; set; }
        public string language { get; set; }
    }
}
