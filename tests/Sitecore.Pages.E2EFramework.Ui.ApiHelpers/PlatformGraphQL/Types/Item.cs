// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

#nullable enable
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types
{
    public class Item : IItem
    {
        public string? name { get; set; }

        public string? itemId { get; set; }

        public string? path { get; set; }

        public string? displayName { get; set; }

        public Template? template { get; set; }

        public FieldValue? createdAt { get; set; }

        public FieldValue? updatedAt { get; set; }

        public ItemConnection? children { get; set; }

        public FieldValue? layout { get; set; }

        public int? version { get; set; }

        public string? versionName { get; set; }

        public List<Item>? versions { get; set; }
        public bool DoNotDelete { get; set; }
        public GraphQLPlatform? GraphQlPlatform { get; set; }
        public FieldValue? publishableFrom { get; set; }
        public FieldValue? publishableTo { get; set; }
        public FieldValue? isPublishable { get; set; }
        public ItemWorkflow? workflow { get; set; }


        public void AddVersion(string language = "en")
        {
            GraphQlPlatform?.AddItemVersion(path, language);
        }


        public void SetWorkFlow(string workflowId = "", string language = "en", int ver = 1)
        {
            if (workflowId == "")
            {
                workflowId = Constants.SampleWorkFlowId;
            }

            const string fieldName = "__Workflow";
            GraphQlPlatform?.UpdateItemField(itemId, fieldName, workflowId, language, ver);
        }

        public void SetWorkflowState(string state = "", string language = "en", int ver = 1)
        {
            if (state == "")
            {
                state = Constants.WorkFlowStateDraft;
            }

            const string fieldName = "__Workflow state";
            GraphQlPlatform?.UpdateItemField(itemId, fieldName, state, language, ver);
        }

        public string? GetFieldValue(string fieldName, string language = "en")
        {
            return GraphQlPlatform?.GetItemFieldValue(this.path, fieldName, language);
        }

        public void SetFieldValue(string fieldName, string value, string language = "en", int version = 1)
        {
            GraphQlPlatform?.UpdateItemField(this.itemId,fieldName,value, language:language,version:version);
        }
    }
    public class ItemWorkflow
    {
        public Workflow? workflow { get; set; }
        public WorkflowState? workflowState { get; set; }
    }

    public class Workflow
    {
        public string? displayName { get; set; }
    }

    public class WorkflowState
    {
        public bool? final { get; set; }
        public string? displayName { get; set; }
        public string? stateId { get; set; }
    }

    public class ItemConnection
    {
        public List<Item>? nodes { get; set; }
    }

    public class FieldValue
    {
        public string? value { get; set; }
    }
}
