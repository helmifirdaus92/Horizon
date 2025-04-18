// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.Helpers
{
    public static class Constants
    {
        public static string SXAHeadlessSite = Context.SXAHeadlessSite;
        public static string EmptySite = "EmptySite";
        public static string SharedSite = Context.SharedSite;
        public static string NonSXASite = "website";
        public static string SharedSitePath = "/sitecore/content/" + Context.SXAHeadlessTenant + "/" + Context.SharedSite;
        public static string SXAHeadlessSiteContentPath = "/sitecore/content/" + Context.SXAHeadlessTenant + "/" + Context.SXAHeadlessSite;
        public static string EmptySiteTemplateId = "{2867D289-8951-458A-AF19-CE93A67BB494}";
        public static string HomePagePath = "/sitecore/content/" + Context.SXAHeadlessTenant + "/" + Context.SXAHeadlessSite + "/Home";
        public static string EmptySiteHomePagePath = $"/sitecore/content/{EmptySite}/{EmptySite}/Home";
        public static string EmptySiteSettingsPath = $"/sitecore/content/{EmptySite}/{EmptySite}/Settings";
        public static string AvailableRenderingsPath = SXAHeadlessSiteContentPath + "/Presentation/Available Renderings";
        public static string AvailableRenderingsTemplateId = "{76DA0A8D-FC7E-42B2-AF1E-205B49E43F98}";
        public static string CustomRenderingId = "{FA9DC08B-8DA6-48C3-9C0A-AA563B4A26A3}";
        public static string CustomPageContentRenderingId = "{3A7985B1-24C4-4CF3-8F7C-5877BBAD27C6}";
        public static string PartialDesignsPath = SXAHeadlessSiteContentPath + "/Presentation/Partial Designs";
        public static string PartialDesignsPathSharedSite = SharedSitePath + "/Presentation/Partial Designs";
        public static string PageDesignsPath = SXAHeadlessSiteContentPath + "/Presentation/Page Designs";
        public static string PageDesignsPathSharedSite = SharedSitePath + "/Presentation/Page Designs";
        public static string PageDesignTemplateId = "{1105B8F8-1E00-426B-BF1F-C840742D827B}";
        public static string SxaHeadlessSiteSettingsPath = SXAHeadlessSiteContentPath + "/Settings";
        public static string SxaHeadlessSiteSettingsSiteGroupingPath = SXAHeadlessSiteContentPath + "/Settings/Site Grouping/" + Context.SXAHeadlessSite;
        public static string SxaBasePageTemplateId = "47151711-26CA-434E-8132-D3E0B7D26683";
        public static string TemplatePagePath = "/sitecore/templates/Project/" + Context.SXAHeadlessTenant + "/Page";
        public static string TemplatePageStandardValuesPath = TemplatePagePath + "/__Standard Values";
        public static string TemplatesFolderPath = "/sitecore/templates/Project/" + Context.SXAHeadlessTenant;
        public static string TemplateWithAllFieldsName = "Page With All Fields";
        public static string TemplateFolderId = "{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}";
        public static string RedirectItemId = "{C14B6289-8AC2-439C-9E5B-40DE9F820C3F}";
        public static string BranchesTemplateId = "{BAD98E0E-C1B5-4598-AC13-21B06218B30C}";
        public static string BranchTemplateId = "{35E75C72-4985-4E09-88C3-0EAC6CD1E64F}";
        public static string TemplateId = "{AB86861A-6030-46C5-B394-E8F99E8B87DB}";
        public static string AlignContentCenterStyleId = "E40687A0-BE10-420C-BC05-9D2B0CA86E76"; // The id is associated to the style : /sitecore/content/SXAHeadlessTenant/SXAHeadlessSite/Presentation/Styles/Content alignment/Align content center
        public static string VisitorFromCphFlowDefinitionId = "cfa85597e43545479aadc27df7ff134e"; //VariantId associated to "Visitor from Copenhagen"

        // error and warning messages
        public static string NameCannotBeEmptyErrMsg = "Name cannot be empty";
        public static string InvalidCharactersErrMsg = "Invalid characters. Characters allowed: A–Z, a–z, 0–9, _. Spaces are also allowed.";
        public static string NameIsAlreadyInUseErrMsg = "Name is already in use";
        public static string NameLengthErrMsg = "An item name length should be less or equal to 100.";
        public static string NoDataTemplateInformation = "No template is using this page design. It will not be available for marketers to choose from.";
        public static string SharedLayoutNotification = "You are editing the shared layout of this page. All the changes you make to the shared layout will be applied to all versions of this page in every language.";
        public static string DatasourceLockedByAnotherUser = "Another user has locked the item or associated content item";
        public static string ItemLockedByAnotherUser = "Your changes cannot be saved because another user has locked the content item";
        public static string ItemLockedErrMsg = "Unable to save changes because the corresponding content has been locked by another user";
        public static string NoWriteAccess = "You cannot edit the item because you do not have write access";
        public static string NoWorkflowWriteAccess = "You do not have permissions to update this item to the next workflow state";
        public static string NoHavePermissionToViewTheItem = "The item you requested cannot be displayed. Either the item does not exist or you do not have permission to view it.";
        public static string PreventOperationFromCompletingErrMsg = "An error prevented the operation from completing";
        public static string ItemNotAnImageErrMsg = "The item is not an image";
        public static string ImageDoesNotExistErrMsg = "The image does not exist";
        public static string SourceFieldIsInvalidErrMsg = "The source of this field is not valid. Contact your site administrator.";
        public static string PageHasBeenChangedMsg = "The item has been modified. Reload the item to see the latest changes.";
        public static string PageDoesNotExistErrMsg = "The page does not exist. The changes cannot be saved. Do you want to reload the page and lose your changes?";
        public static string NoSitesAvailableErrMsg = "There are no sites available in this environment. Switch environment or create a new site.";
        public static string VariantsPerformanceDataWarningMsg = "There was an issue in getting variants performance data. Try again later, or contact your XM Cloud administrator if the issue persists.";

        // For access updates
        public static string SXASiteItemID = "{4CC6F3D1-47DF-421A-BB76-92F06389E0E5}";
        public static string SXASharedSiteItemID = "{EB9386C4-94B6-49C2-9FC3-5CF791147296}";
        public static string WebSiteHomeItemID = "{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}";
        public static string TemplatesItemId = "{3C1715FE-6A13-4FCF-845F-DE308BA9741D}";

        //Date formats
        public static string DateFormatInTemplateAppDetailsInfo = "dddd, d MMMM yyyy 'at' HH:mm";
        private static string _sxaHeadlessSiteTemplatesParentId;
        private static string _sxaHeadlessSiteDataTextsFolderId;

        private static string _sxaHeadlessSiteSiteGroupingItemId;

        private static string _templatePageId;

        private static string _homePageId;

        private static string _pageDesignsItemId;

        private static string _pageDesignFolderTemplateId;
        private static string _partialDesignTemplateId;
        private static string _partialDesignFolderTemplateId;

        public static string SxaHeadlessSiteTemplatesParentId
        {
            get
            {
                if (string.IsNullOrEmpty(_sxaHeadlessSiteTemplatesParentId))
                {
                    _sxaHeadlessSiteTemplatesParentId = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/templates/Project/" + Context.SXAHeadlessTenant).itemId;
                }

                return _sxaHeadlessSiteTemplatesParentId;
            }
        }

        public static string SxaHeadlessSiteDataTextsFolderId
        {
            get
            {
                if (string.IsNullOrEmpty(_sxaHeadlessSiteDataTextsFolderId))
                {
                    _sxaHeadlessSiteDataTextsFolderId = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{SXAHeadlessSiteContentPath}/Data/Texts").itemId;
                }

                return _sxaHeadlessSiteDataTextsFolderId;
            }
        }

        public static string SxaHeadlessSiteSiteGroupingItemId
        {
            get
            {
                if (string.IsNullOrEmpty(_sxaHeadlessSiteSiteGroupingItemId))
                {
                    _sxaHeadlessSiteSiteGroupingItemId = Context.ApiHelper.PlatformGraphQlClient.GetItem(SxaHeadlessSiteSettingsSiteGroupingPath).itemId;
                }

                return _sxaHeadlessSiteSiteGroupingItemId;
            }
        }

        public static string TemplatePageId
        {
            get
            {
                if (string.IsNullOrEmpty(_templatePageId))
                {
                    _templatePageId = Context.ApiHelper.PlatformGraphQlClient.GetItem(TemplatePagePath).itemId;
                }

                return _templatePageId;
            }
        }

        public static string HomePageId
        {
            get
            {
                if (string.IsNullOrEmpty(_homePageId))
                {
                    _homePageId = Context.ApiHelper.PlatformGraphQlClient.GetItem(HomePagePath).itemId;
                }

                return _homePageId;
            }
        }

        public static string PageDesignsItemId
        {
            get
            {
                if (string.IsNullOrEmpty(_pageDesignsItemId))
                {
                    _pageDesignsItemId = Context.ApiHelper.PlatformGraphQlClient.GetItem(PageDesignsPath).itemId;
                }

                return _pageDesignsItemId;
            }
        }

        public static string PageDesignFolderTemplateId
        {
            get
            {
                if (string.IsNullOrEmpty(_pageDesignFolderTemplateId))
                {
                    _pageDesignFolderTemplateId = Context.ApiHelper.PlatformGraphQlClient.GetItem($"/sitecore/templates/Project/{Context.SXAHeadlessTenant}/Page Design Folder").itemId;
                }

                return _pageDesignFolderTemplateId;
            }
        }

        public static string PartialDesignTemplateId
        {
            get
            {
                if (string.IsNullOrEmpty(_partialDesignTemplateId))
                {
                    _partialDesignTemplateId = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/templates/Foundation/JSS Experience Accelerator/Presentation/Partial Design").itemId;
                }

                return _partialDesignTemplateId;
            }
        }

        public static string PartialDesignFolderTemplateId
        {
            get
            {
                if (string.IsNullOrEmpty(_partialDesignFolderTemplateId))
                {
                    _partialDesignFolderTemplateId = Context.ApiHelper.PlatformGraphQlClient.GetItem($"/sitecore/templates/Project/{Context.SXAHeadlessTenant}/Partial Design Folder").itemId;
                }

                return _partialDesignFolderTemplateId;
            }
        }
    }
}
