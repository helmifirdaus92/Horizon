// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;

namespace Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data
{
    public static class Constants
    {
        public static string EditorCanvasCssSelector = "iframe:not([hidden])";
        public static string TimelineCssSelector = "app-timeline-content";
        public static string TombstoneCssSelector = "app-timeline-tombstone";
        public static string RenderingCodeSelector = "code[chrometype='rendering'][kind='open']";
        public static string contentTreeSelector = "ng-spd-tree";
        public static string pageComponentsTabButtonSelector = "ng-spd-tab-group button[title='Components']";
        public static string pageComponentsTabSelector = "app-left-hand-side app-component-gallery";
        public static string createFolderPanelSelector = "app-create-folder";
        public static string datasourceDialogSelector = "app-datasource-dialog";
        public static string createPersonalizationDialogSelector = "app-personalization-dialog";
        public static string analyticsToolTipSelector = "ngx-tooltip-content";
        public static string popOverLocator = "ng-spd-popover";
        public static string dialogLocator = "ng-spd-dialog-panel";

        public static Dictionary<string, string> SXAPages = new()
        {
            {
                "Home", "{7ca61e1b-ed7b-49b0-b600-b12edcda22e4}"
            },
            {
                "About", "{a395f27e-706e-4ef3-b7da-e01cfd08bd77}"
            }
        };

        public static string SXAHeadlessSite = "SXAHeadlessSite";
        public static string SXAHeadlessSiteContentPath = "/sitecore/content/SXAHeadlessTenant/SXAHeadlessSite";
        public static string SxaHeadlessSitePartialDesignsPath = SXAHeadlessSiteContentPath + "/Presentation/Partial Designs";
        public static string EmptySite = "EmptySite";
        public static string EmptySiteTemplateId = "{2867D289-8951-458A-AF19-CE93A67BB494}";
        public static string SxaHeadlessSiteSettingsPath = SXAHeadlessSiteContentPath + "/Settings/Site Grouping/SXAHeadlessSite";
        public static string SxaHeadlessSitePageDesignsPath = SXAHeadlessSiteContentPath + "/Presentation/Page Designs";
        public static string SxaHeadlessSiteTemplatesParentId = "{CFD616A1-E7AD-4720-94CA-CB5A0F53D224}";
        public static string SxaBasePageTemplateId = "47151711-26CA-434E-8132-D3E0B7D26683";
        public static string PageDesignsTemplateId = "{1105B8F8-1E00-426B-BF1F-C840742D827B}";

        public static (string, string) GetRenderingSelectors(string renderingName) =>
            ($"[hintname = '{renderingName}'][kind='open']", $"[hintname = '{renderingName}'][kind='open'] ~ :not(code)");

        public static (string, string) GetPlaceholderSelectors(string placeholderName) =>
            ($"[key = '{placeholderName}'][kind='open']", $"[key = '{placeholderName}'][kind='open'] ~ :not(code)");
    }
}
