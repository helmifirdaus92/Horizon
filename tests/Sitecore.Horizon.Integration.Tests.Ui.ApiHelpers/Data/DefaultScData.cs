// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Template;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data
{
    public class DefaultScData
    {
        public static string MvcTemplatePath = "/sitecore/templates/MvcItemTemplate";

        public static string SampleTemplatePath = "/sitecore/templates/Sample/Sample Item";
        public static string SxaHeadlessPageTemplatePath = "/sitecore/templates/Project/SXAHeadlessTenant/Page";
        public static string SxaDataSourceTemplatePath = "/sitecore/templates/Foundation/Experience Accelerator/Local Datasources/Page Data";

        public enum SxaRenderings
        {
            None,
            Title,
            RichText,
            Promo,
            PageContent,
            Image
        }

        public static List<TemplateSection> SampleItemFields
        {
            get
            {
                var fieldSections = new List<TemplateSection>
                {
                    new TemplateSection("Data", new Dictionary<string, string>
                    {
                        {
                            "Title", "Single-Line Text"
                        },
                        {
                            "Text", "Rich Text"
                        }
                    })
                };
                return fieldSections;
            }
        }

        public static string RenderingId(SxaRenderings sxaRenderings) => sxaRenderings switch
        {
            SxaRenderings.Title => "{3836D951-BB14-43AC-9231-649B7F245DC5}",
            SxaRenderings.RichText => "{9C6D53E3-FE57-4638-AF7B-6D68304C7A94}",
            SxaRenderings.Promo => "{2492BAC4-DA07-4C86-87F0-9873D40E2276}",
            SxaRenderings.PageContent => "{C5F905F8-FD1F-444E-A9E5-AC6B774FF0DE}",
            SxaRenderings.Image =>"{AB2EDBA0-3960-4F12-B765-579DC231894A}",
            _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
        };

        public static string RenderingDataSourceTemplate(SxaRenderings sxaRenderings) => sxaRenderings switch
        {
            SxaRenderings.Title => null,
            SxaRenderings.RichText => "/sitecore/templates/Feature/JSS Experience Accelerator/Page Content/Text",
            SxaRenderings.Promo => "/sitecore/templates/Feature/JSS Experience Accelerator/Page Content/Promo",
            SxaRenderings.PageContent => null,
            SxaRenderings.Image => "/sitecore/templates/Feature/JSS Experience Accelerator/Media/Image",
            _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
        };

        public static (string,string) RenderingDataSourceTextFieldDetails(SxaRenderings sxaRenderings) => sxaRenderings switch
        {
            SxaRenderings.Title => ("Title","{0BB4A8B8-1DD7-4FC4-AE77-AEE7404B19CF}"),
            SxaRenderings.RichText => ("Text","{729034FC-24F3-40B7-8FA4-FB49D7DE20DD}"),
            SxaRenderings.Promo => ("PromoText","{28079F3A-896B-4273-BE5F-59D0EBB7CD7D}"),
            SxaRenderings.PageContent => ("Content",null),
            SxaRenderings.Image => ("ImageCaption","{455A3E98-A627-4B40-8035-E683A0331AC7}"),
            _ => throw new ArgumentOutOfRangeException(nameof(sxaRenderings), $"Not expected SxaRendering value: {sxaRenderings}")
        };

        public static class MarketingAttributes
        {
            public static class Events
            {
                public const string Path = "/sitecore/system/Settings/Analytics/Page Events";
                public const string Template = "{059CFBDF-49FC-4F14-A4E5-B63E1E1AFB1E}";
            }

            public static class Campaigns
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Campaigns";
                public const string Template = "{94FD1606-139E-46EE-86FF-BC5BF3C79804}";
            }

            public static class Goals
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Goals";
                public const string Template = "{475E9026-333F-432D-A4DC-52E03B75CB6B}";
            }

            public static class Outcomes
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Outcomes";
                public const string Template = "{EE43C2F0-6277-4144-B144-8CA2CEFCCF12}";
            }

            public static class Profiles
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Profiles";
                public const string Template = "{07624A03-BB2F-45D8-ABE1-15E2B1705FF3}";
                public const string CardTemplate = "{0FC09EA4-8D87-4B0E-A5C9-8076AE863D9C}";
                public const string KeyTemplate = "{44AB5107-3C73-42F0-A427-BEC549F944B9}";
            }

            public static class Pattern
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Profiles";
                public const string Template = "{4A6A7E36-2481-438F-A9BA-0453ECC638FA}";
            }

            public static class Preset
            {
                public const string Path = "/sitecore/system/Marketing Control Panel/Experience Explorer/Presets/";
                public const string Template = "{656218DF-C490-45FC-90C4-B58FB38838F7}";
            }
        }

        public static class GenericItems
        {
            public const string ContentItemId = "{0DE95AE4-41AB-4D01-9EB0-67441B7C2450}";
            public const string ContentItemPath = "/sitecore/content";
            public const string SystemTemplatesPath = "/sitecore/templates/System/Templates";

            public const string SampleItemTemplateId = "{76036F5E-CBCE-46D1-AF0A-4143F9B557AA}";
            public const string SampleItemTemplatePath = "/sitecore/templates/Sample/Sample Item";
            public const string SampleItem = "Sample Item";
            public const string SampleItemTitleFieldId = "";
            public const string SampleItemTextFieldId = "";


            public const string HomeItemId = "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}";
            public const string HomeItemPath = "/sitecore/content/Home";
            public const string MediaLibraryId = "{3D6658D8-A0BF-4E75-B3E2-D050FABCF4E1}";
            public const string MediaLibraryPath = "/sitecore/media library";
            public const string RenderingsItemId = "{32566F0E-7686-45F1-A12F-D7260BD78BC3}";
            public const string LayoutItemId = "{75CC5CE4-8979-4008-9D3C-806477D57619}";
            public const string FolderTemplateId = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";

            public const string SampleLayoutId = "{14030E9F-CE92-49C6-AD87-7D49B50E42EA}";
            public const string SampleLayoutPath = "/sitecore/layout/Layouts/Sample Layout";
            public const string SampleLayoutFilePath = "/layouts/Sample layout.aspx";

            public const string SampleSublayoutId = "{885B8314-7D8C-4CBB-8000-01421EA8F406}";
            public const string SampleSubayoutPath = "/sitecore/layout/Sublayouts/Sample Sublayout";
            public const string SampleSublayoutFilePath = "/layouts/Sample Sublayout.ascx";

            public const string SampleInnerSublayoutId = "{CE4ADCFB-7990-4980-83FB-A00C1E3673DB}";
            public const string SampleInnerSubayoutPath = "/sitecore/layout/Sublayouts/Sample Inner Sublayout";
            public const string SampleInnerSublayoutFilePath = "/layouts/Sample Inner Sublayout.ascx";

            public const string DatasourceSublayoutId = "{9EB73C4C-1AF7-47C7-85B8-93E08176D4D2}";
            public const string DatasourceSublayoutPath = "/sitecore/layout/Sublayouts/Sample Datasource Sublayout";
            public const string SampleDatasourceSublayoutFilePath = "/layouts/Sample Datasource Sublayout.ascx";

            public const string SampleRenderingId = "{493B3A83-0FA7-4484-8FC9-4680991CF743}";
            public const string SampleRenderingPath = "/sitecore/layout/Renderings/Sample/Sample Rendering";
            public const string SampleRenderingFilePath = "/xsl/sample rendering.xslt";

            public const string PlaceholderSettingsTemplateId = "{5C547D4E-7111-4995-95B0-6B561751BF2E}";

            public const string DefaultDeviceId = "{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}";
            public const string PrintDeviceId = "{46D2F427-4CE5-4E1F-BA10-EF3636F43534}";
            public const string DefaultMvcLayoutName = "TestMvcLayout";
            public const string SampleRenderingName = "Sample Rendering";
            public const string TemplateFolderTemplateId = "{0437FEE2-44C9-46A6-ABE9-28858D9FEE8C}";
            public const string SampleRenderingUid = "{B343725A-3A93-446E-A9C8-3A2CBD3DB489}";
            public const string ContentPlaceholderSettingsId = "{8AE1C245-A4FA-46AE-9B35-4FBC15F63169}";
            public const string ContentPlaceholderSettingsPath = "/sitecore/layout/Placeholder Settings/content";
            public const string PlaceholderSettingFolderPath = "/sitecore/layout/Placeholder Settings";
            public const string FolderDeviceId = "{E18F4BC6-46A2-4842-898B-B6613733F06F}";
            public const string DeviceTemplateId = "{B6F7EEB4-E8D7-476F-8936-5ACE6A76F20B}";
            public const string FieldRendererID = "{E1AF4AA3-3B5D-4611-8C71-959AD261E5B7}";
        }

        public static class MvcRendering
        {
            public const string RenderingText =
                "@inherits System.Web.Mvc.WebViewPage\r\n@using Sitecore.Mvc\r\n<h1 style=\"padding:30px\">@Html.Sitecore().Field(\"title\")</h1>\r\n<div style=\"padding:30px\">@Html.Sitecore().Field(\"text\")</div>";

            public const string ViewRenderingItemTemplateId = "{99F8905D-4A87-4EB8-9F8B-A9BEBFB3ADD6}";
        }

        public static class MvcLayout
        {
            public const string LayoutText =
                "@inherits System.Web.Mvc.WebViewPage\r\n@using Sitecore.Mvc;\r\n@{\r\nLayout = null;\r\n}\r\n<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Transitional//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd\">\r\n<html lang=\"en\" xml:lang=\"en\" xmlns=\"http://www.w3.org/1999/xhtml\">\r\n<head>\r\n<title>@Html.Sitecore().Field(\"title\", new { DisableWebEdit = true })</title>\r\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\" />\r\n<link href=\"/default.css\" rel=\"stylesheet\"/>\r\n</head>\r\n<body>\r\n<center>\r\n<div id = \"Content\" style=\"padding:500px\" > @Html.Sitecore().Placeholder(\"content\") </div>\r\n</center>\r\n</body>\r\n</html>\r\n";

            public const string LayoutTemplateId = "{3A45A723-64EE-4919-9D41-02FD40FD1466}";
        }

        public static class Language
        {
            public const string Path = "/sitecore/system/Languages";
            public const string Template = "{F68F13A6-3395-426A-B9A1-FA2DC60D94EB}";
            public const string Charset = "iso-8859-1";
            public const string Encoding = "utf-8";
            public const string CodePage = "65001";
            public const string DefaultLanguageCode = "fr";
            public const string DefaultRegonalIsoCode = "fr-CH";
        }

        public static class Workflow
        {
            public static class AnalyticWorkflow
            {
                public const string WorkflowId = "{689E2994-4656-4C58-9112-7826CB46EE69}";
                public const string WorkflowStateDeployed = "{EDCBB550-BED3-490F-82B8-7B2F14CCD26E}";
                public const string WorkflowStateDraft = "{39156DC0-21C6-4F64-B641-31E85C8F5DFE}";
            }

            public static class SampleWorkflow
            {
                public const string WorkflowId = "{A5BC37E7-ED96-4C1E-8590-A26E64DB55EA}";
                public const string WorkflowStateDraft = "{190B1C84-F1BE-47ED-AA41-F42193D9C8FC}";
                public const string WorkflowStateAvaitingApproval = "{46DA5376-10DC-4B66-B464-AFDAA29DE84F}";
                public const string WorkflowStateApproved = "{FCA998C5-0CC3-4F91-94D8-0A4E6CAECE88}";
            }
        }

        public static class Template
        {
            public const string MediaFolderTemplateId = "{FE5DD826-48C6-436D-B87A-7C4210C7413B}";
            public const string MediaUnversionedJpegTemplateId = "{DAF085E8-602E-43A6-8299-038FF171349F}";
            public const string MediaVersionedJpegTemplateId = "{EB3FB96C-D56B-4AC9-97F8-F07B24BB9BF7}";
            public const string TemplateId = "{AB86861A-6030-46C5-B394-E8F99E8B87DB}";

            public const string RootItemId =
                "{B29EE504-861C-492F-95A3-0D890B6FCA09}"; // /sitecore/templates/User Defined

            public const string SectionTemplateId =
                "{E269FBB5-3750-427A-9149-7AA950B49301}"; // 	/sitecore/templates/System/Templates/Template section

            public const string BranchTemplateId = "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}"; //  /sitecore/templates/System/Branches/Branch
        }

        public static class Placeholder
        {
            public const string TemplateId = "{5C547D4E-7111-4995-95B0-6B561751BF2E}";

            public const string RootItemId =
                "{1CE3B36C-9B0C-4EB5-A996-BFCB4EAA5287}"; // /sitecore/layout/Placeholder Settings
        }

        public static class SampleMvcTemplate
        {
            public const string Name = "UtfEeSampleMvcTemplate";
            public const string RootItemName = "UtfEeTemplates";
            public const string LayoutName = "UtfEeSampleMvcLayout";
            public const string LayoutRootItemName = "UtfEeLayouts";
            public const string RenderingName = "UtfEeSampleMvcRendering";
            public const string RenderingRootItemName = "UtfEeRenderings";

            public const string RenderingPath = "/sitecore/layout/Renderings/" + RenderingRootItemName + "/" +
                RenderingName;

            public const string RenderingUid = "{3728A656-48B6-4F5C-BAE7-25454C01828E}";
            public const string RenderingUidForPrintDevice = "{20389951-74F1-4C23-9C41-9885018C93FA}";
            public static string Id = "";
            public static string Path = "/sitecore/templates/" + RootItemName + "/" + Name;
        }

        public static class Sublayout
        {
            public const string TemplateId = "{0A98E368-CDB9-4E1E-927C-8E0C24A003FB}";
            public const string RootItemId = "{EB443C0B-F923-409E-85F3-E7893C8C30C2}"; // /sitecore/layout/Sublayouts
        }

        public static class Fields
        {
            public const string SharedRendering = "__Renderings";
            public const string FinalRendering = "__Final Renderings";
            public const string TitleField = "title";
            public const string TextField = "text";
            public const string LinkField = "link";
            public const string DateField = "date";
            public const string DateTimeField = "dateTime";
            public const string NumberField = "number";
            public const string IntegerField = "integer";
            public const string ImageField = "image";
            public const string MultyLineTextField = "multyLineText";
        }

        public static class Publishing
        {
            public const string InternetTarget = "Internet";
        }
    }
}
