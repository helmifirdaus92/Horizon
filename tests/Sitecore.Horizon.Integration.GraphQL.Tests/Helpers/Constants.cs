// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;

public static class Constants
{
    public static string SXAHeadlessSite = Context.SXAHeadlessSite;
    public static string SXAHeadlessTenantPath = $"/sitecore/content/{Context.SXAHeadlessTenant}";
    public static string SXAHeadlessSiteItemPath = $"{SXAHeadlessTenantPath}/{SXAHeadlessSite}";
    public static string HomePagePath = $"{SXAHeadlessSiteItemPath}/Home";
    public static string AboutPagePath = $"{SXAHeadlessSiteItemPath}/Home/About";
    public static string TemplatePagePath = $"/sitecore/templates/Project/{Context.SXAHeadlessTenant}/Page";
    public static string FolderTemplateId = "A87A00B1-E6DB-45AB-8B54-636FEC3B5523";
    public static string FolderTemplatePath = "/sitecore/templates/Common/Folder";
    public static string MediaLibraryPath = "/sitecore/media library";
    public static string MediaLibraryId = "3D6658D8-A0BF-4E75-B3E2-D050FABCF4E1";

    public static string SampleWorkflowId = "A5BC37E7-ED96-4C1E-8590-A26E64DB55EA";
    public static string WorkflowDraftId = "190B1C84-F1BE-47ED-AA41-F42193D9C8FC";
    public static string WorkflowAwaitingApprovalId = "46DA5376-10DC-4B66-B464-AFDAA29DE84F";
    public static string WorkflowApprovedId = "FCA998C5-0CC3-4F91-94D8-0A4E6CAECE88";
    public static string WorkflowSubmitActionId = "CF6A557D-0B86-4432-BF47-302A18238E74";
    public static string WorkflowApproveActionId = "F744CC9C-4BB1-4B38-8D5C-1E9CE7F45D2D";
    public static string WorkflowRejectActionId = "E44F2D64-1EED-42FF-A7DA-C07B834096AC";

    public static string SxaRenderingRichText = "9C6D53E3-FE57-4638-AF7B-6D68304C7A94";
    public static string SxaRenderingRichTextTemplate = "0A7AA373-5ED1-4E9B-9678-22D3C5FAF6DF";
    public static string SxaDataSourceTemplateId = "1C82E550-EBCD-4E5D-8ABD-D50D0809541E";
}
