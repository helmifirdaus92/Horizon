// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Drawing;
using System.Drawing.Imaging;
using Newtonsoft.Json;
using OpenQA.Selenium;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.SxaRestClient.Responses;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.PageLayout;
using ApiConstants = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Constants;
using Rendering = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses.Rendering;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Helpers;

public class Preconditions
{
    private static Item _partialDesignsItem;
    private static Item _pageDesignsItem;

    public static Item PageDesignsItem
    {
        get
        {
            _pageDesignsItem ??= Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.PageDesignsPath);
            return _pageDesignsItem;
        }
    }

    public static Item PartialDesignsItem
    {
        get
        {
            _partialDesignsItem ??= Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.PartialDesignsPath);
            return _partialDesignsItem;
        }
    }

    private static Item _templatePage => Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.TemplatePagePath);

    public static Item CreateAndOpenPage(string displayName = "", bool doNotDelete = false, string language = "en")
    {
        // create page
        Item testPage = CreatePage(displayName: displayName, doNotDelete: doNotDelete, language: language);

        // change Site to test site
        OpenSXAHeadlessSite();

        // change language to default
        OpenEnglishLanguage();

        OpenPageInSiteTree(testPage.displayName);

        return testPage;
    }

    public static void OpenSXAHeadlessSite()
    {
        if (Context.Pages.Editor.TopBar.GetSelectedSite() != Constants.SXAHeadlessSite)
        {
            Context.Pages.Editor.TopBar.OpenSitesDropdown().SelectSite(Constants.SXAHeadlessSite);
        }
    }

    public static void OpenEnglishLanguage()
    {
        if (Context.Pages.Editor.TopBar.GetSelectedLanguage() != "English")
        {
            Context.Pages.Editor.TopBar.SelectLanguage("English");
        }
    }

    public static void SelectPageByNameFromSiteTree(string pageName)
    {
        if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem == null)
        {
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageName).Select();
        }
        else
        {
            if (Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name != pageName)
            {
                Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(pageName).Select();
            }
        }
    }
    public static void OpenPageInSiteTree(string pageName)
    {
        Context.Pages.TopBar.AppNavigation.OpenEditor();
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Logger.Write($"Page {pageName} requested at : " + DateTime.Now);
        Context.Pages.Editor.LeftHandPanel.SelectPage(pageName);
    }

    public static void AddLanguageAndRefreshSession(string language, string regionCode = "")
    {
        if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
        {
            var languageName = language;
            if (regionCode.Equals(""))
            {
                Context.ApiHelper.PlatformGraphQlClient.AddLanguage(language);
            }
            else
            {
                Context.ApiHelper.PlatformGraphQlClient.AddLanguage(language, regionCode);
                languageName = language + "-" + regionCode;
            }

            var siteSettingsItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsPath);
            Item item = Context.ApiHelper.PlatformGraphQlClient.GetItem($"/sitecore/system/Languages/{languageName}");
            Context.ApiHelper.PlatformGraphQlClient.AddSupportedLanguagesToSiteSettings(siteSettingsItem, item.itemId);
        }
        else
        {
            XMAppsApi xmAppsApi = new (TestRunSettings.XMAppsApi);
            List<string> supportedLanguages;
            var siteId = Context.Sites.Find(s => s.name.Equals(Constants.SXAHeadlessSite)).id;
            if (regionCode.Equals(""))
            {
                supportedLanguages = new List<string>
                {
                    "en",
                    "da",
                    $"{language}"
                };
            }
            else
            {
                supportedLanguages = new List<string>
                {
                    "en",
                    "da",
                    $"{language}-{regionCode}"
                };
            }

            xmAppsApi.UpdateSiteLanguages(siteId, supportedLanguages);
        }

        Context.Browser.Refresh();
    }

    public static Item CreatePage(string name = null, string displayName = "", bool doNotDelete = false, string parentId = null, string templateId = null, string language = "en")
    {
        if (name == null)
        {
            var random = new Random();
            var uniqNumber = random.Next(10000, 99999).ToString();
            name = "Test page " + uniqNumber;
        }

        parentId ??= Constants.HomePageId;
        templateId ??= _templatePage.itemId;
        IItem testPage = CreateItem(name: name, parentId: parentId, templateId: templateId, displayName: displayName, language: language, doNotDelete: doNotDelete);

        testPage.SetWorkFlow();
        testPage.SetWorkflowState();
        return Context.ApiHelper.PlatformGraphQlClient.GetItem(testPage.path, language);
    }

    public static void CreatePageAsync(string name, bool doNotDelete = false, string parentId = null, string templateId = null, string language = "en")
    {
        parentId ??= Constants.HomePageId;
        templateId ??= _templatePage.itemId;
        CreateItemAsync(name, parentId, templateId, language, doNotDelete: doNotDelete);
    }

    public static bool CreateMultiplePages(string nameStartsWith, int count)
    {
        try
        {
            List<string> pageNames = new();

            for (int i = 0; i < 80; i++)
            {
                pageNames.Add(nameStartsWith + RandomFiveDigitNumberAsString());
                CreatePageAsync(pageNames.Last(), parentId: Constants.HomePageId);
            }

            foreach (var page in pageNames)
            {
                var pageItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.HomePagePath + "/" + page);
                Context.TestItems.Add(page, pageItem);
                TestData.Items.Add(pageItem);
            }
        }
        catch (Exception e)
        {
            Logger.Write("Page created has failed with error:" + e.Message);
            return false;
        }

        return true;
    }

    public static Item CreateFolder(string name = null, string displayName = "", string parentId = null, bool doNotDelete = false)
    {
        if (name == null)
        {
            var random = new Random();
            var uniqNumber = random.Next(10000, 99999).ToString();
            name = "Test Folder " + uniqNumber;
        }

        parentId ??= Constants.HomePageId;
        IItem testFolder = CreateItem(name: name, parentId: parentId, templateId: ApiConstants.FolderTemplateId, displayName: displayName, doNotDelete: doNotDelete);

        return Context.ApiHelper.PlatformGraphQlClient.GetItem(testFolder.path);
    }

    public static Item CreatePageDesign(string name, string parentId = null, bool shared = false, bool doNotDelete = false)
    {
        parentId ??= shared == false
            ? PageDesignsItem.itemId
            : Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.PageDesignsPathSharedSite).itemId;
        return CreateItem(name, parentId, Constants.PageDesignTemplateId, doNotDelete: doNotDelete);
    }

    public static Item CreatePageDesignFolder(string folderName, string parentId = null, bool doNotDelete = false)
    {
        parentId ??= PageDesignsItem.itemId;
        return CreateItem(folderName, parentId, Constants.PageDesignFolderTemplateId, doNotDelete: doNotDelete);
    }

    public static Item CreatePartialDesign(string name, string parentId = null, bool shared = false, bool doNotDelete = false, string displayName = "")
    {
        parentId ??= shared == false
            ? PartialDesignsItem.itemId
            : Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.PartialDesignsPathSharedSite).itemId;
        return CreateItem(name, parentId, Constants.PartialDesignTemplateId, doNotDelete: doNotDelete, displayName: displayName);
    }

    public static Item CreatePartialDesignFolder(string folderName, string parentId = null, bool doNotDelete = false, string displayName = "")
    {
        parentId ??= PartialDesignsItem.itemId;
        return CreateItem(folderName, parentId, Constants.PartialDesignFolderTemplateId, doNotDelete: doNotDelete, displayName: displayName);
    }

    public static Item CreateItem(string name, string parentId, string templateId, string displayName = "", string language = "en", bool doNotDelete = false)
    {
        var creationResult = Context.ApiHelper.PlatformGraphQlClient.CreateItem(name, parentId, templateId, displayName: displayName, language: language);
        if (doNotDelete)
        {
            creationResult.DoNotDelete = true;
        }

        if (creationResult == null)
        {
            return null;
        }

        Context.TestItems.Add(name, creationResult);
        TestData.Items.Add(creationResult);

        return creationResult;
    }

    public static void CreateItemAsync(string name, string parentId, string templateId, string language = "en", bool doNotDelete = false)
    {
        Context.ApiHelper.PlatformGraphQlClient.CreateItemAsync(name, parent: parentId, templateId: templateId, language: language);
    }

    public static void ConfigurePageDesigns(string siteName, string templateId, string pageDesignId)
    {
        Context.ApiHelper.PlatformGraphQlClient.ConfigurePageDesigns(siteName, templateId, pageDesignId);
    }

    public static Item CreateTemplate(string templateName, string parentId, List<string> baseTemplates, bool doNotDelete = false)
    {
        CreateItemTemplateResponse response = Context.ApiHelper.PlatformGraphQlClient.CreateItemTemplate(templateName: templateName, parentId: parentId, baseTemplates: baseTemplates);
        Item templateItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(response.createItemTemplate.itemTemplate.templateId);
        if (doNotDelete)
        {
            templateItem.DoNotDelete = true;
        }

        TestData.Items.Add(templateItem);
        return templateItem;
    }

    //TODO move to extensions
    public static void DragAndDropToTheOutlineToolbar(string newRendering, string position, string destinationRendering, int verticalDisposition = 5)
    {
        IWebElement componentToDrop = null;

        CanvasControl rendering = Context.Pages.Editor.CurrentPage.GetControl(destinationRendering);
        rendering.ScrollToElement();
        Point pointInRendering = Context.Pages.Editor.GetDropPointOfRendering(position, rendering, verticalDisposition);

        componentToDrop = newRendering switch
        {
            "Rich Text" => Context.Pages.Editor.LeftHandPanel.ComponentGallery.GetPageContentComponent(newRendering),
            "Page Content" => Context.Pages.Editor.LeftHandPanel.ComponentGallery.GetPageContentComponent(newRendering),
            "Title" => Context.Pages.Editor.LeftHandPanel.ComponentGallery.GetPageContentComponent(newRendering),
            "Image" => Context.Pages.Editor.LeftHandPanel.ComponentGallery.GetMediaComponent(newRendering),
            "Container" => Context.Pages.Editor.LeftHandPanel.ComponentGallery.GetPageStructureComponent(newRendering),
            _ => componentToDrop
        };
        componentToDrop.DragToPoint(pointInRendering);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    public static void SetUserRoles(string emailAddress, List<string> roles)
    {
        User user = Context.ApiHelper.PlatformGraphQlClient.GetUsers().Find(u =>
            u.profile.email != null && u.profile.email.Equals(emailAddress));
        if (user != null)
        {
            Context.ApiHelper.PlatformGraphQlClient.UpdateUser(user.profile.userName, roles);
        }
    }

    public static Item UploadImage(string name, string extension, Item destinationFolder, string altText = null, string language = null, int width = 150, int height = 150, bool doNotDelete = false)
    {
        altText ??= $"{name}.{extension}";
        var backColor = language == null ? Color.AntiqueWhite : Color.Coral;
        var image = DrawTextImage($"{name}.{extension}", Color.Green, backColor, new Size(width, height));
        var data = ConvertToByteArray(image);
        Context.ApiHelper.HorizonGraphQlClient.UploadMedia(name, extension, blob:
            Convert.ToBase64String(data), destinationFolder.itemId, site: Constants.SXAHeadlessSite);

        Item imageItem = Context.ApiHelper.PlatformGraphQlClient.GetItem($"{destinationFolder.path}/{name}");

        if (doNotDelete)
        {
            imageItem.DoNotDelete = true;
        }

        TestData.Items.Add(imageItem);
        imageItem.SetFieldValue("Alt", altText);

        return imageItem;
    }

    public static string AddComponent(string pageId, string pagePath, string renderingId, string displayName = "", string language = "en", int version = 1, string placeholderKey = "headless-main")
    {
        string datasource;
        pageId = pageId.Contains('-') ? pageId : Wrappers.Helpers.ConvertItemIdToGuid(pageId);

        // SXA insert rendering request. Returns rendering parameters (GridParameters, FieldNames) for presentation details
        var insertRenderingResponse = Context.ApiHelper.SxaRestClient.InsertRendering(pageId, renderingId, language);

        // Link List and Promo components requires not strict datasource creation. Steps: create Data folder, pre-create datasource item, make local path for datasource item
        if (renderingId == DefaultScData.RenderingId(DefaultScData.SxaRenderings.Promo) || renderingId == DefaultScData.RenderingId(DefaultScData.SxaRenderings.LinkList))
        {
            var createDatasourceFolder = Context.ApiHelper.SxaRestClient.PopulatePageData(pageId, renderingId, language);

            string templateId = DefaultScData.RenderingDataSourceTemplate(renderingId == DefaultScData.RenderingId(DefaultScData.SxaRenderings.Promo) ? DefaultScData.SxaRenderings.Promo : DefaultScData.SxaRenderings.LinkList);

            string datasourceId = Context.ApiHelper.HorizonGraphQlClient.CreateRawItem(createDatasourceFolder.pageDataId, displayName, templateId, language).id;
            datasource = Context.ApiHelper.SxaRestClient.MakeLocalPath(pageId, datasourceId).datasource;
        }
        else
        {
            // Title and Container components don't have datasource
            datasource = insertRenderingResponse.dataSourceBehaviour.dataSourceTemplate == "" ? string.Empty : Context.ApiHelper.SxaRestClient.CreateDatasource(pageId, renderingId, language).datasource;
        }

        // Set presentation details for datasource
        var details = Context.ApiHelper.HorizonGraphQlClient.GetPagePresentationDetails(pagePath, language, version: version);
        string presentationDetails = UpdatePresentationDetails(details.presentationDetails, renderingId, datasource, placeholderKey, insertRenderingResponse.renderingParameters);

        // Save datasource to the page item
        Context.ApiHelper.HorizonGraphQlClient.Save(pageId, details.layoutEditingKind, presentationDetails, details.presentationDetails, language: language, itemVersion: version);
        return presentationDetails;
    }

    static string RandomFiveDigitNumberAsString()
    {
        var random = new Random();
        var uniqNumber = random.Next(10000, 99999).ToString();
        return uniqNumber;
    }

    public static void WaitForImageToBeIndexed(string rootPath, string query, string language = "en", int expectedImages = 1)
    {
        Context.ApiHelper.HorizonGraphQlClient.WaitForCondition(request =>
        {
            var response = request.MediaQuery(rootPath, new List<string>(), query, language);
            MediaQueryResponse media = JsonConvert.DeserializeObject<MediaQueryResponse>(response.Data.mediaQuery.ToString());
            if (media.items.Count > 0)
            {

                string mediaItemsString = string.Join(", ", media.items.Select(m =>
                    $"{{ Id: {m.id}, DisplayName: {m.displayName} }}"
                ));
                Logger.Write($"Indexed Media query items: {mediaItemsString}");
            }

            return media.items.Count == expectedImages;
        }, TimeSpan.FromSeconds(30), 500, message: "Images are not indexed after 30 seconds.", failOnFalse:true);
    }

    public static void WaitForItemToBeIndexed(string rootPath, string query, int expectedCout = 1)
    {
        Context.ApiHelper.PlatformGraphQlClient.WaitForCondition(request =>
        {
            var response = request.SearchResultTotalCount(query, rootPath);
            return response >= expectedCout;
        }, TimeSpan.FromSeconds(30), 500, message: "Items are not indexed after 30 seconds.");
    }

    private static string UpdatePresentationDetails(string details, string renderingId, string datasource, string placeholderKey, RenderingParameters parameters)
    {
        var presentationDetails = JsonConvert.DeserializeObject<DevicesPayload>(details);

        var rendering = new Rendering()
        {
            id = renderingId,
            instanceId = Guid.NewGuid().ToString(),
            placeholderKey = placeholderKey,
            dataSource = datasource,
            parameters = new RenderingParameters()
            {
                GridParameters = parameters.GridParameters,
                CSSStyles = parameters.CSSStyles,
                DynamicPlaceholderId = parameters.DynamicPlaceholderId,
                FieldNames = parameters.FieldNames,
                Styles = parameters.Styles,
                RenderingIdentifier = parameters.RenderingIdentifier
            }
        };

        presentationDetails.devices[0].renderings = presentationDetails.devices[0].renderings.Append(rendering).ToArray();

        return JsonConvert.SerializeObject(presentationDetails);
    }

    private static Image DrawTextImage(string textOnImage, Color textColor, Color backColor, Size minSize)
    {
#pragma warning disable CA1416
        Image retImg = new Bitmap(minSize.Width, minSize.Height);
        using var drawing = Graphics.FromImage(retImg);
        drawing.Clear(backColor);

        using Brush textBrush = new SolidBrush(textColor);
        drawing.DrawString(textOnImage, new Font(FontFamily.GenericSerif, 12), textBrush, 0, 0);
        drawing.Save();
#pragma warning restore CA1416

        return retImg;
    }

    private static byte[] ConvertToByteArray(Image image)
    {
        using var ms = new MemoryStream();
#pragma warning disable CA1416
        image.Save(ms, ImageFormat.Jpeg);
#pragma warning restore CA1416
        return ms.ToArray();
    }
}
