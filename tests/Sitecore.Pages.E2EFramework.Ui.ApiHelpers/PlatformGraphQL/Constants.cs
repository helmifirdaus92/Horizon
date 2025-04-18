// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL
{
    public static class Constants
    {
        public static string FolderTemplateId = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";
        public static string SampleWorkFlowId = "{A5BC37E7-ED96-4C1E-8590-A26E64DB55EA}";
        public static string WorkFlowStateDraft = "{190B1C84-F1BE-47ED-AA41-F42193D9C8FC}";
        public static string WorkFlowStateApproved = "{FCA998C5-0CC3-4F91-94D8-0A4E6CAECE88}";
        public static string CRUDWithInheritanceAndDescendants = "|pd|+item:delete|+item:write|+item:read|^*|+item:rename|+item:create|pe|+item:delete|+item:write|+item:read|^*|+item:rename|+item:create|";
        public static string DenyReadAccess = "|pd|-item:read|pe|-item:read|";
        public static string AllowReadAccess = "|pd|+item:read|pe|+item:read|";
        public static string DenyWriteAccess = "|pd|-item:write|pe|-item:write|";
        public static string DenyDeleteAccess = "|pd|-item:delete|pe|-item:delete|";
        public static string DenyCreateAccess = "|pd|-item:create|pe|-item:create|";
        public static string DenyRenameAccess = "|pd|-item:rename|pe|-item:rename|";
        public static string DenyLanguageWriteAccess = "|pd|-language:write|pe|-language:write|";
        public static string AllowLanguageWriteAccess = "|pd|+language:write|pe|+language:write|";
        public static string DenyLanguageReadAccess = "|pd|-language:read|pe|-language:read|";
        public static string AllowLanguageReadAccess = "|pd|+language:read|pe|+language:read|";
        public static string DenyWorkflowCommandExecuteAccess = "|pd|-workflowCommand:execute|pe|-workflowCommand:execute|";
        public static string AllowWorkflowCommandExecuteAccess = "|pd|+workflowCommand:execute|pe|+workflowCommand:execute|";
    }
}
