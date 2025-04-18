// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using RestSharp;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Requests;

public class CreateCollection : RestRequest
{
    public string name { get; set; }
    public string displayName { get; set; }
    public string description { get; set; }
}
