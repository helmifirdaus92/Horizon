// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using FluentAssertions;
using Sitecore.Horizon.Integration.Editor.Tests.UI.Helpers;
using Sitecore.Horizon.Integration.Editor.Tests.UI.Properties;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Page;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HorizonEntities.Presentation;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.DeviceSwitcher;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Components.TimedNotification;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data;
using Reqnroll;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI.CommonSteps
{
    [Binding]
    public class CommonSteps
    {
        private static readonly string _additionalSiteName = "AdditionalSite";
        private readonly ISecurityOperations _securityHelper = Context.ApiHelper.Security;
        private TimedNotification _notification;


        [AfterScenario("collapsePanels", Order = 0)]
        public static void ExpandPanels()
        {
            Context.Editor.RightPanel.Expand();
            Context.Editor.ContentTree.Expand();
        }

        [AfterScenario("languageChange", Order = 0)]
        public static void ResetLanguageToEnglish()
        {
            Context.Editor.Open(language: "en", site: "website");
        }

        [AfterScenario("siteChange", Order = 0)]
        public static void ResetSiteToDefault()
        {
            Context.Editor.Open(site: "website");
        }

        [AfterScenario("customUserLogin", Order = 0)]
        public static void LoginAsAuthor()
        {
            Context.User = new User(Settings.AuthorUser.UserName, Settings.AuthorUser.Password, new List<string>());
            Context.Horizon.Browser.PauseConsoleErrorCollection();
            Context.Editor = Context.Horizon.ReloginWithDifferentUser(Context.User.FullUserName, Context.User.Password).Editor;
            Context.Horizon.Browser.ResumeConsoleErrorCollection();
        }

        [AfterScenario("adminUserLogin", Order = 0)]
        public static void LoginBackAsAuthor()
        {
            Context.User = new User(Settings.AuthorUser.UserName, Settings.AuthorUser.Password, new List<string>());
            Context.Horizon.Browser.PauseConsoleErrorCollection();
            Context.Editor = Context.Horizon.ReloginWithDifferentUser(Context.User.FullUserName, Context.User.Password).Editor;
            Context.Horizon.Browser.ResumeConsoleErrorCollection();
        }

        [BeforeFeature("DragComponentToOccupiedPlaceholder")]
        [BeforeFeature("DeleteComponent")]
        [BeforeFeature("DragComponentToEmptyPlaceholder")]
        [BeforeFeature("AssignDatasource")]
        [BeforeFeature("RearrangeComponents")]
        [BeforeScenario("AssignDatasource")]
        public static void CreateRenderings()
        {
            var rendering1 = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcSampleRendering();
            var rendering2 = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcSampleRendering2();
            var rendering3 = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcSampleRendering3();
            var rendering4 = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcRenderingWithAllFieldTypes();
        }

        [AfterScenario("additionalSite", Order = 0)]
        public static void RemoveAdditionalSitePatch()
        {
            Context.Horizon.ClearCookies();
            Context.Editor = Context.Horizon.Editor.Open();
        }

        [Given(@"Page has raw value '(.*)' in '(.*)' field")]
        public void FieldHasRowValue(string value, string field)
        {
            Context.Page.Edit(field, value);
        }

        [Then(@"'(.*)' timed notification specifying '(.*)' appears")]
        public void ThenTimedNotificationAppears(NotificationType type, string notification)
        {
            _notification = Context.Editor.TimedNotification;
            if (notification.Contains("ContextPage"))
            {
                notification= notification.Replace("ContextPage", Context.Page.Name);
            }
            _notification.WaitForCondition(m => !string.IsNullOrEmpty(m.Message), 3000);
            _notification.Message.Should().Be(notification);
            _notification.Type.Should().Be(type);
        }

        [Then(@"'(.*)' timed notification containing text '(.*)' appears")]
        public void ThenTimedNotificationAppearsContainingText(NotificationType type, string notification)
        {
            _notification = Context.Editor.TimedNotification;
            if (notification.Contains("ContextPage"))
            {
                notification= notification.Replace("ContextPage", Context.Page.Name);
            }
            _notification.WaitForCondition(m => !string.IsNullOrEmpty(m.Message), 3000);
            _notification.Message.Should().Contain(notification);
            _notification.Type.Should().Be(type);
        }

        [When(@"User refreshes content tree")]
        [Given(@"User refreshes content tree")]
        public void WhenUserRefreshesContentTree()
        {
            Context.Editor.ContentTree.Expand();
            var rootItem = Context.Editor.ContentTree.RootItem;
            if (rootItem.HasChildren)
            {
                rootItem.Collapse();
                rootItem.Expand();
            }
            else
            {
                Context.Editor.Open(site: "website").ContentTree.Expand();
            }

            Context.Editor.ContentTree.WaitForLoading();
        }

        [When(@"User opens page in Content Tree")]
        public void WhenUserOpensPageInContentTree()
        {
            WhenUserRefreshesContentTree();
            Context.Editor.ContentTree.GetItem(Context.Page).Select();
        }

        [When(@"User launches Horizon Editor app")]
        [Given(@"User launches Horizon Editor app")]
        public void WhenUserLaunchesHorizonEditorApp()
        {
            Context.Editor.Open(site: "website").ContentTree.Expand();
        }

        [Then(@"Site start page is displayed")]
        public void ThenSiteStartPageIsDisplayed()
        {
            Context.Editor.CurrentPage.GetText().Should().Contain(Context.SiteStartItem.Name.Equals("Home") ? "Sitecore Experience Platform" : Context.SiteStartItem.Name);
        }

        [Given(@"User has '(.*)' access to the page")]
        public void UserHaveAccessToTheItem(SecurityRight right)
        {
            Context.Page.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right);
        }

        [Given(@"User has '(.*)' access to child page")]
        public void GivenUserHasAccessToChildPage(SecurityRight right)
        {
            Context.ChildPage.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right);
        }

        [Given(@"User has '(.*)' access to the datasource")]
        public void GivenUserHasAccessToTheDatasource(SecurityRight right)
        {
            Context.DatasourcePage.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right);
        }

        [Given(@"User does not have '(.*)' access to the page")]
        public void GivenUserDoesNotHaveAccessToTheItem(SecurityRight right)
        {
            Context.Page.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Deny);
        }

        [Given(@"User does not have '(.*)' access to image '(.*)'")]
        public void GivenUserDoesNotHaveAccessToTheItem(SecurityRight right, string imagePath)
        {
            var imageItem = Context.ApiHelper.Items.GetItem(imagePath);
            imageItem.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Deny);
        }

        [Given(@"User does not have '(.*)' access to media folder '(.*)'")]
        public void GivenUserDoesNotHaveAccessToMediaFolder(SecurityRight right, string mediaFolderPath)
        {
            var mediaFolderItem = Context.ApiHelper.Items.GetItem(mediaFolderPath);
            mediaFolderItem.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Deny);
        }

        [Given(@"User does not have '(.*)' access to the child page")]
        public void GivenUserDoesNotHaveAccessToTheChildPage(SecurityRight right)
        {
            Context.ChildPage.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Deny);
        }

        [Given(@"User has '(.*)' access to item '(.*)'")]
        public void GivenUserHasAccessToItem(SecurityRight right, string itemPath)
        {
            var item = Context.ApiHelper.Items.GetItem(itemPath);
            item.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Allow);
        }

        [Given(@"User does not have '(.*)' access to item '(.*)'")]
        public void GivenUserDoesNotHaveAccessToItem(SecurityRight right, string itemPath)
        {
            var item = Context.ApiHelper.Items.GetItem(itemPath);
            item.StandardFields.Security.SetSecurityRight(Context.User.FullUserName, right, AccessType.Deny);
        }

        [Given(@"page exists")]
        [Given(@"Page exists")]
        public void GivenPageExists()
        {
            Context.Page = Context.ApiHelper.Items.CreatePage();
        }

        [Given(@"page has sample workflow as default workflow")]
        public void GivenPageHasSampleWorkflowAsDefaultWorkflow()
        {
            Context.Page.StandardFields.Workflow.SetDefaultWorkflow(DefaultScData.Workflow.SampleWorkflow.WorkflowId);
        }

        [Given(@"Page '(.*)' exists")]
        public void GivenPageWithNameExists(string pageName)
        {
            Context.Page = Context.ApiHelper.Items.CreatePage(new PageParams(name: pageName));
        }

        [Given(@"User publishes the page with related items")]
        public void WhenUserPublishesThePageWithRelatedItems()
        {
            Context.Page.Publish(languages: new[]
            {
                "en"
            }, publishRelatedItems: true);
        }

        [Given(@"Page has '(.*)' template")]
        [Given(@"The page has (.*) template")]
        public void ItemIsCreatedFromTemplate(LayoutType pageType)
        {
            Context.Page = Context.ApiHelper.Items.CreatePage(pageType);
        }

        [Given(@"Page has template with all types fields")]
        [Given(@"the page has template with all types fields")]
        public void GivenThePageHasTemplateWithAllFieldTypes()
        {
            var templateWithAllTypesFields = Context.ApiHelper.Items.PermanentlyCreatedItems.GetTemplateWithAllFieldTypes();
            Context.Page = Context.ApiHelper.Items.CreatePage(new PageParams(template: templateWithAllTypesFields.Id));

            //in order to select link in canvas it should have some link inside
            Context.Page.Edit("GeneralLinkField", "<link text=\"\" anchor=\"\" linktype=\"internal\" class=\"\" title=\"\"  querystring=\"\" id=\"{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}\" />");
        }

        [Given(@"page exists with rendering '(.*)' containing 'Title' top nested field")]
        public void PageExistsWithRenderingContainingNestedFields(string renderingName)
        {
            var templateWithAllTypesFields = Context.ApiHelper.Items.PermanentlyCreatedItems.GetTemplateWithAllFieldTypes();
            Context.Page = Context.ApiHelper.Items.CreatePage(new PageParams(template: templateWithAllTypesFields.Id));

            var renderingWithNestedField = Context.ApiHelper.Items.CreateRendering(LayoutType.Mvc, renderingName, Resources.MvcRenderingWithNestedField);
            Context.Page.StandardFields.Layout.AddControl(renderingWithNestedField);
        }

        [Given(@"page has a '(.*)' language version")]
        public void GivenPageHasALanguageVersion(string language)
        {
            Context.Page.AddVersion(language);
        }

        [Given(@"User logs in to Horizon Editor app")]
        [When(@"User logs in to Horizon Editor app")]
        public void WhenUserLogsInToHorizonEditorApp()
        {
            Context.Horizon.Browser.PauseConsoleErrorCollection();
            Context.Editor = Context.Horizon.ReloginWithDifferentUser(Context.User.FullUserName, Context.User.Password).Editor;
            Context.Horizon.Browser.ResumeConsoleErrorCollection();
        }

        [Given(@"admin user logs in to Horizon Editor app")]
        public void GivenAdminUserLogsInToHorizonEditorApp()
        {
            Context.Horizon.Browser.PauseConsoleErrorCollection();
            Context.Editor = Context.Horizon.ReloginWithDifferentUser(Settings.AdminUser.UserName, Settings.AdminUser.Password).Editor;
            Context.Horizon.Browser.ResumeConsoleErrorCollection();
        }

        [Given(@"User goes to the page")]
        [When(@"User goes to the page")]
        [When(@"User goes to the page by URL")]
        [When(@"user goes to the page")]
        public void WhenUserGoesToThePage()
        {
            Context.Editor.Open(Context.Page, site: "website");
            Context.Editor.ContentTree.Expand();
        }

        [Given(@"user goes to the page in sxa site")]
        public void GivenUserGoesToThePageInSxaSite()
        {
            Context.Editor.Open(Context.Page, site: Constants.SXAHeadlessSite);
            Context.Editor.ContentTree.Expand();
        }

        [Given(@"user opens page with '([^']*)' language in sxa site")]
        public void GivenUserOpensPageWithLanguageInSxaSite(string language)
        {
            Context.Editor.Open(Context.Page.Id, site: Constants.SXAHeadlessSite, language: language);
        }

        [Given(@"Page with child page exists")]
        public void GivenPageWithChildPageExists()
        {
            Context.Page = Context.ApiHelper.Items.CreatePage();
            Context.ChildPage = Context.Page.CreateChildPage();
        }

        [Given(@"Sxa page with child page exists")]
        public void GivenSxaPageWithChildPageExists()
        {
            var rendering = Context.ApiHelper.Items.GetItem(DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText));
            Context.Page = Context.ApiHelper.Items.CreatePageSxa();
            var dsItem = Context.ApiHelper.Items.AddSxaRenderingDataSourceItemToPage((PageItem)Context.Page, DefaultScData.SxaRenderings.RichText, "Text 1");

            Context.Page.StandardFields.Layout.AddControl(rendering, "headless-main", dsItem.Id);
            Context.ChildPage = Context.Page.CreateChildPage(LayoutType.SXA);
        }

        [Given(@"Child page exists")]
        public void GivenChildPageExists()
        {
            Context.ChildPage = Context.Page.CreateChildPage();
        }

        [Given(@"user goes to child page")]
        public void GivenUserGoesToChildPage()
        {
            Context.Editor.Open(Context.ChildPage, site: "website");
            Context.Editor.ContentTree.Expand();
        }

        [Then(@"child is selected in the content tree")]
        public void ThenChildIsSelectedInTheContentTree()
        {
            Context.Editor.ContentTree.SelectedItem.Name.Should().Be(Context.ChildPage.Name);
        }

        [Given(@"Folder with sub-items exists")]
        public void GivenFolderWithSub_ItemsExists()
        {
            Context.Folder = Context.ApiHelper.Items.CreateFolder();
            Context.ChildPage = Context.Folder.CreateChildPage();
            Context.ChildPage.CreateChildPage();
        }

        [Given(@"Page with '(.*)' versions for '(.*)' language exists")]
        public void GivenPageWithVersionsOfLanguageExists(int count, string language)
        {
            Context.Page = Context.ApiHelper.Items.CreatePage();
            Context.Page.StandardFields.Appearance.SetDisplayName($"Page {language} version");
            for (int i = 1; i <= count; i++)
            {
                var versionNumber = i;
                if (versionNumber != 1)
                {
                    Context.Page.AddVersion(language);
                }

                Context.Page.EditVersion(language, versionNumber, "Title", $"Languge: {language}, version: {versionNumber}");
            }
        }

        [When(@"User opens page with '(.*)' language using query parameters")]
        [Given(@"User opens page with '(.*)' language using query parameters")]
        public void WhenUserOpensPageWithLanguageUsingQueryParameters(string language)
        {
            Context.Editor.Open(Context.Page.Id, language, site: "website");
        }

        [When(@"User waits for the timed notification to disappear")]
        public void WhenUserWaitsForTheTimedNotificationToDisappear()
        {
            Context.Editor.WaitForNotificationToDisappear();
        }


        [Given(@"The page has '(.*)' workflow state")]
        public void GivenThePageHasWorkflowState(PageWorkflowState workflowState)
        {
            Context.Page.StandardFields.Workflow.SetWorkflowState(workflowState);
        }

        [Given(@"Page with datasources exists")]
        public void GivenPageWithDatasourcesExists(Table table)
        {
            Context.Page = Context.ApiHelper.Items.CreatePage();
            foreach (TableRow raw in table.Rows)
            {
                IPageItem datasource = Context.ApiHelper.Items.CreatePage(new PageParams(raw["DatasourceName"]));
                IRenderingItem rendering = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcSampleRendering();
                Context.Page.StandardFields.Layout.AddControl(rendering, datasourceId: datasource.Id);
            }
        }

        [Given(@"Page with datasource exists")]
        public void GivenPageWithDatasourceExists()
        {
            Context.Page = Context.ApiHelper.Items.CreatePage();
            Context.DatasourcePage = Context.ApiHelper.Items.CreatePage();
            IRenderingItem rendering = Context.ApiHelper.Items.PermanentlyCreatedItems.GetMvcSampleRendering();
            Context.Page.StandardFields.Layout.AddControl(rendering, datasourceId: Context.DatasourcePage.Id);
        }

        [Given(@"Additional site has '(.*)' default language")]
        public void GivenAdditionalSiteHasDefaultLanguage(string language)
        {
            Context.SiteStartItem = Context.ApiHelper.Items.CreatePage(new PageParams($"Home of {_additionalSiteName}", "/sitecore/content"));
            Context.ApiHelper.Configuration.AddSite(_additionalSiteName, Context.SiteStartItem.Path, language: language);
        }

        [When(@"User switches to the additional site using query parameter")]
        public void WhenUserSwitchesToTheAdditionalSiteUsingQueryParameterSc_Lang()
        {
            Context.Editor.Open(site: _additionalSiteName);
            Context.Horizon.Browser.WaitForDocumentLoaded();
            Context.Editor.CurrentPage.WaitForLoading();
        }

        [When(@"User switches to the additional site in '(.*)' language using query parameter")]
        public void WhenUserSwitchesToTheAdditionalSiteInLanguageUsingQueryParameter(string language)
        {
            Context.Editor.Open(site: _additionalSiteName, language: language);
            Context.Editor.CurrentPage.WaitForLoading();
        }

        [When(@"User switches to '(.*)' language using query parameter")]
        public void WhenUserSwitchesToAdditionalLanguageUsingQueryParameterSc_Lang(string language)
        {
            Context.Editor.Open(language: language);
            Context.Editor.CurrentPage.WaitForLoading();
        }

        [Given(@"User has no access to the Horizon app")]
        public void GivenUserHasNoAccessToTheHorizonApp()
        {
            User user = Context.ApiHelper.Security.CreateUserWithRoles("Test", new[]
            {
                "sitecore\\Sitecore Client Users"
            });
            Context.Horizon.Login(user.FullUserName, user.Password);
        }

        [Then(@"Requested document was not found page rendered")]
        public void ThenRequestedDocumentWasNotFoundPageRendered()
        {
            var textOnPage = Context.Editor.CurrentPage.GetText();
            textOnPage.Should().Contain("The requested document was not found");
        }

        [Given(@"Page '(.*)' has '(.*)' template")]
        public void ItemIsCreatedFromTemplate(string pageKey, LayoutType pageType)
        {
            var page = Context.ApiHelper.Items.CreatePage(pageType);
            Context.TestPages[pageKey] = page;
        }

        [Given(@"user opens '(.*)' page in Editor")]
        [When(@"user opens '(.*)' page in Editor")]
        public void GivenUserOpensInEditor(string pageKey)
        {
            var page = Context.TestPages[pageKey];
            Context.Editor.Open(page, "website");
        }

        [Given(@"User opens '(.*)' page and '(.*)' site in Editor")]
        public void GivenUserOpensInEditor(string pageKey, string site)
        {
            var page = Context.TestPages[pageKey];
            Context.Editor.Open(page.ShortId, site: site);
        }

        [Given(@"user opens '(.*)' page from sxa site in Editor")]
        public void GivenUserOpensPageInSxaSite(string pageKey)
        {
            var page = Context.TestPages[pageKey];
            Context.Editor.Open(page.ShortId, site: Constants.SXAHeadlessSite);
        }

        [Given(@"user opens '(.*)' page in Editor specifying '(.*)' site and '(.*)' language in Url")]
        public void GivenUserOpensPageInEditorSpecifyingSiteAndLanguage(string pageKey, string site, string language)
        {
            var page = Context.TestPages[pageKey];
            Context.Editor.Open(page.ShortId, language: language, site: site);
        }

        [Given(@"user opens '([^']*)' page in Editor specifying '([^']*)' site and '([^']*)' language in Url and not wait")]
        public void GivenUserOpensPageInEditorSpecifyingSiteAndLanguageInUrlAndNotWait(string pageKey, string site, string language)
        {
            var page = Context.TestPages[pageKey];
            Context.Editor.Open(page.ShortId, language: language, site: site, waitForCanvas:false);
        }


        [Given(@"Page '(.*)' has link to page '(.*)'")]
        public void GivenPageHasLinkToPage(string pageWithLink, string linkedPageKey)
        {
            var page = Context.TestPages[pageWithLink];
            var linkedPage = Context.TestPages[linkedPageKey];
            string rawValueOfTextWithLinksPlaceholders = "<a href=\"~/link.aspx?_id={0}&sc_site=website&amp;_z=z\">Link to '{1}' page</a>";
            string valuewithLink = string.Format(rawValueOfTextWithLinksPlaceholders, linkedPage.Id, linkedPage.Name, DefaultScData.GenericItems.HomeItemId).Replace("{", "").Replace("}", "");
            page.EditVersion("en", 1, "Text", valuewithLink);
        }

        [Given(@"User clicks on link to page '(.*)'")]
        public void GivenUserClicksOnLinkToPage(string linkedPageKey)
        {
            var page = Context.TestPages[linkedPageKey];
            string linkCssSelector = string.Format("a[href*='id={0}']", page.ShortId);
            Context.Editor.CurrentPage.GetControl(linkCssSelector).CtrlClick();
            Context.Editor.WaitForNewPageInCanvasLoaded();
        }

        [Given(@"User clicks on link containing path to page '(.*)'")]
        public void GivenUserClicksOnLinkContainingPathToPage(string linkedPageKey)
        {
            var page = Context.TestPages[linkedPageKey];
            string linkCssSelector = string.Format($"a[href*='{page.Name}']");
            Context.Editor.CurrentPage.GetControl(linkCssSelector).CtrlClick();
            Context.Editor.WaitForNewPageInCanvasLoaded();
        }

        [Given(@"User clicks on link to non existent page '(.*)'")]
        public void GivenUserClicksOnLinkTononExistenPage(string linkedPageKey)
        {
            var page = Context.TestPages[linkedPageKey];
            string linkCssSelector = string.Format("a[href*='id={0}']", page.ShortId);
            Context.Editor.CurrentPage.GetControl(linkCssSelector).CtrlClick();
            Context.Editor.WaitForNewPageInCanvasLoaded();
        }

        [Then(@"Page '(.*)' is rendered in Editor and version is '(.*)' and language is '(.*)'")]
        public void ThenPageIsRenderedInCanvas(string pageKey, int version, string language)
        {
            var page = Context.TestPages[pageKey];
            string field = "Title";
            var titleFieldValue = page.GetFieldValue(field, language, version);
            var textOnPage = Context.Editor.CurrentPage.GetText();
            bool actuallyRendered = textOnPage.StartsWith(titleFieldValue);
            actuallyRendered.Should().BeTrue($"Page '{page.Path}' is not rendered. Text on page is: {textOnPage}");
        }

        [Then(@"page '(.*)' is the context page in the application")]
        public void ThenPageIsContextPage(string pageKey)
        {
            ThenPageIsRenderedInCanvas(pageKey, 1, "en");
            var page = Context.TestPages[pageKey];
            var displayName = page.GetDisplayName("en");
            var expectedName = string.IsNullOrEmpty(displayName) ? page.Name : displayName;
            Context.Editor.ContentTree.SelectedItem.Name.Should().Be(expectedName);
            Context.Editor.RightPanel.Header.Should().Be(expectedName);
            //Context.Editor.RightPanel.ExpandItemDetails().ItemPath.Should().Be(page.Path);
        }

        [Given(@"Item '(.*)' has '(.*)' language version with '(.*)' display name")]
        public void GivenItemDaEksempelPaElementDisplayName(string itemPath, string language, string displayName)
        {
            var item = Context.ApiHelper.Items.GetItem(itemPath);
            item.AddVersion(language);
            item.SetDisplayName(displayName, language);
        }

        [Then(@"language '(.*)' and site '(.*)' are specified in url query parameter")]
        public void ThenLanguageIsSpecifiedInUrlQueryParameters(string language, string site)
        {
            Context.Editor.UrlContainsRequiredParams(Context.Page, language, site).Should()
                .BeTrue($"Parameters should be resolved: sc_site={site}, sc_lang={language}, sc_itemid={Context.Page.Id}");
        }

        [Then(@"id of page '(.*)' and language '(.*)' and site '(.*)' are specified in url query parameter")]
        public void ThenIdOfPageAndLanguageAndSiteAreSpecifiedInUrlQueryParameters(string pageKey, string language, string site)
        {
            Context.Editor.UrlContainsRequiredParams(Context.TestPages[pageKey], language, site).Should()
                .BeTrue($"Parameters should be resolved: sc_site={site}, sc_lang={language}, sc_itemid={Context.TestPages[pageKey].Id}");
        }

        [Then(@"id of page '(.*)' and language '(.*)' and site '(.*)' and version '(.*)' all are specified in url query parameter")]
        public void ThenIdOfPageAndLanguageAndSiteAndVersionArSpecifiedInUrlQueryParameter(string pageKey, string language, string site, int version)
        {
            Context.Editor.UrlContainsRequiredParams(Context.TestPages[pageKey], language, site, version).Should()
                .BeTrue($"Parameters should be resolved: sc_site={site}, sc_lang={language}, sc_itemid={Context.TestPages[pageKey].Id}, sc_version={version}");
        }

        [Given(@"user opens Editor")]
        [When(@"user opens Editor")]
        public void GivenUserOpensEditor()
        {
            Context.Editor.Open(site: "website");
        }

        [Given(@"user opens sxa site in Editor")]
        [When(@"user opens sxa site in Editor")]
        public void GivenUserOpensSxaSiteInEditor()
        {
            Context.Editor.Open(site: Constants.SXAHeadlessSite);
        }

        [Given(@"page '(.*)' is created with an sxa template")]
        public void GivenPageIsCreatedWithAnSxaTemplate(string pageKey)
        {
            var page = Context.ApiHelper.Items.CreatePageSxa();
            page.StandardFields.InsertOptions.AssignInsertOptions(new[]
            {
                page.Template.Id
            });
            Context.TestPages[pageKey] = page;
        }
    }
}
