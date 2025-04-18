// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;

public interface IItem
{
    bool DoNotDelete { get; set; }
    public string name { get; set; }

    public string itemId { get; set; }

    public string path { get; set; }

    public string displayName { get; set; }
    GraphQLPlatform GraphQlPlatform { get; set; }
    void AddVersion(string language="en");
    void SetWorkFlow(string workflowId = "", string language = "en", int ver = 1);
    void SetWorkflowState(string state = "", string language = "en", int ver = 1);
    string GetFieldValue(string fieldName, string language = "en");
    void SetFieldValue(string fieldName, string value,string language = "en", int version = 1);
}
