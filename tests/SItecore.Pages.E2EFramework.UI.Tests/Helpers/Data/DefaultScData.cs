// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;

public class DefaultScData
{
    public static string SxaDataSourceTemplateId = "1C82E550-EBCD-4E5D-8ABD-D50D0809541E";
    public static string MainPlaceholderItemId = "284D388A-9D4E-4742-A298-EC6871592D4B";
    public static string UnversionedImageTemplateId = "DAF085E8-602E-43A6-8299-038FF171349F";

    public enum SxaRenderings
    {
        None,
        Title,
        RichText,
        Promo,
        PageContent,
        Image,
        LinkList,
        CustomComponent,
        Container
    }

    public static string RenderingDataSourceTemplate(SxaRenderings sxaRenderings) => sxaRenderings switch
    {
        SxaRenderings.Title => null,
        SxaRenderings.RichText => "0A7AA373-5ED1-4E9B-9678-22D3C5FAF6DF",
        SxaRenderings.Promo => "DFED4457-D760-457A-BEC1-C0DCCDC44381",
        SxaRenderings.PageContent => null,
        SxaRenderings.Image => "D885DF8C-B2D6-4007-B34B-2BBAFB527304",
        SxaRenderings.LinkList => "F2490B61-7D7D-4BBF-8CF6-3B355FDF4CE4",
        _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
    };

    public static string RenderingDataSourceTemplatePath(SxaRenderings sxaRenderings) => sxaRenderings switch
    {
        SxaRenderings.Title => null,
        SxaRenderings.RichText => "/sitecore/templates/Feature/JSS Experience Accelerator/Page Content/Text",
        SxaRenderings.Promo => "/sitecore/templates/Feature/JSS Experience Accelerator/Page Content/Promo",
        SxaRenderings.PageContent => null,
        SxaRenderings.Image => "/sitecore/templates/Feature/JSS Experience Accelerator/Media/Image",
        _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
    };

    public static string RenderingId(SxaRenderings sxaRenderings) => sxaRenderings switch
    {
        SxaRenderings.Title => "{3836D951-BB14-43AC-9231-649B7F245DC5}",
        SxaRenderings.RichText => "{9C6D53E3-FE57-4638-AF7B-6D68304C7A94}",
        SxaRenderings.Promo => "{2492BAC4-DA07-4C86-87F0-9873D40E2276}",
        SxaRenderings.PageContent => "{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}",
        SxaRenderings.Image => "{AB2EDBA0-3960-4F12-B765-579DC231894A}",
        SxaRenderings.LinkList => "{4956263D-1195-4D6E-931B-800EA625FF6F}",
        SxaRenderings.CustomComponent => "{FA9DC08B-8DA6-48C3-9C0A-AA563B4A26A3}",
        SxaRenderings.Container => "{7A1D9A21-B8D7-42F9-9B0B-92ABF8D1974F}",
        _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
    };

    public static class Language
    {
        public const string Path = "/sitecore/system/Languages";
        public const string Template = "{F68F13A6-3395-426A-B9A1-FA2DC60D94EB}";
    }

    public static class WorkflowInfo
    {
        public static class SampleWorkflow
        {
            public const string WorkflowId = "{A5BC37E7-ED96-4C1E-8590-A26E64DB55EA}";
            public const string WorkflowStateDraft = "{190B1C84-F1BE-47ED-AA41-F42193D9C8FC}";
            public const string WorkflowStateAwaitingApproval = "{46DA5376-10DC-4B66-B464-AFDAA29DE84F}";
            public const string WorkflowStateApproved = "{FCA998C5-0CC3-4F91-94D8-0A4E6CAECE88}";
        }
    }
}
