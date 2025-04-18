// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.Editor.LanguageSwitcher;

public class LanguageSwitcherTests : BaseFixture
{
    private const string TestPageWithLanguageVersions = "TestPageWithLanguageVersions";
    private const string ChildPageWithLanguageVersions = "ChildPageWithLanguageVersions";
    private const string DaDisplayNameTestPage = "DaDisplayNameTestPage";
    private const string ChildDaDisplayNameTestPage = "ChildDaDisplayNameTestPage";
    private const string DisplayNameField = "__Display name";
    private const string DaValueTitleField = "DaValueTitleField";
    private const string TestPageUndoRedo = "TestPageUndoRedo";
    private const string EnFirstValue = "EnFirstValue";
    private const string DaFirstValue = "DaFirstValue";
    private const string EnSecondValue = "EnSecondValue";
    private const string DaSecondValue = "DaSecondValue";
    private const string PageBE = "PageBE";
    private const string PageFR = "PageFR";
    private const string PageDE = "PageDE";
    private const string FallBackPage = "FallBackPage";
    private const string PageForUrlTest = "PageForUrlTest";
    private Item SiteSettingsItem => Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsPath);

    [OneTimeSetUp]
    public void AddTestData()
    {
        if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
        {
            // add languages
            Context.ApiHelper.PlatformGraphQlClient.AddLanguage("fr", regionCode: "FR");
            Context.ApiHelper.PlatformGraphQlClient.AddLanguage("de", regionCode: "DE");
            Context.ApiHelper.PlatformGraphQlClient.AddLanguage("nl", regionCode: "BE");
            Context.ApiHelper.PlatformGraphQlClient.AddLanguage("ja", regionCode: "JP"); // added for fallback to "da"

            List<string> languageItems = new List<string>();
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/fr-FR").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/de-DE").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/ja-JP").itemId);
            Context.ApiHelper.PlatformGraphQlClient.AddSupportedLanguagesToSiteSettings(SiteSettingsItem, languageItems);
        }
        else
        {
            XMAppsApi xmAppsApi = new XMAppsApi(TestRunSettings.XMAppsApi);
            var siteId = Context.Sites.Find(s => s.name.Equals(Constants.SXAHeadlessSite)).id;
            List<string> supportedLanguages = new List<string>
            {
                "en",
                "da",
                "fr-FR",
                "de-DE",
                "ja-JP",
                "nl-BE"
            };
            xmAppsApi.UpdateSiteLanguages(siteId, supportedLanguages);
        }


        // reload Pages to get new languages
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Preconditions.OpenSXAHeadlessSite();
    }

    [SetUp]
    public void SetEnglishLanguage()
    {
        Preconditions.SelectPageByNameFromSiteTree("Home");
        Preconditions.OpenEnglishLanguage();
    }

    [Test]
    public void ChangeLanguageViaDropdown_LanguageChanges()
    {
        // add test data
        var testPage = Preconditions.CreatePage(displayName: TestPageWithLanguageVersions);
        testPage.AddVersion("da");
        testPage.SetFieldValue(DisplayNameField, DaDisplayNameTestPage, language: "da", version: 1);
        Preconditions.AddComponent(testPage.itemId, testPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title), language: "da");

        var childPage = Preconditions.CreatePage(displayName: ChildPageWithLanguageVersions, parentId: testPage.itemId, doNotDelete: true);
        childPage.AddVersion("da");
        childPage.SetFieldValue(DisplayNameField, ChildDaDisplayNameTestPage, language: "da", version: 1);

        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(TestPageWithLanguageVersions);
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = DaValueTitleField;
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        // test
        Context.Pages.Editor.CurrentPage.TextInputs.First().Text.Should().Be(DaValueTitleField);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name.Should().Be(DaDisplayNameTestPage);

        Context.Pages.Editor.LeftHandPanel.SiteContentTree
            .GetItemByPath(ChildDaDisplayNameTestPage).Name
            .Should().Be(ChildDaDisplayNameTestPage);

        Context.Browser.PageUrl.Should().Contain("sc_lang=da");
    }

    [Test]
    public void LanguageSwitcherShows_AllLanguagesDefined()
    {
        var allLanguages = Context.Pages.Editor.TopBar.GetAllLanguages();
        allLanguages.Should().HaveCount(6);
        allLanguages.Should().Contain("English")
            .And.Contain("Danish")
            .And.Contain("French (France)")
            .And.Contain("German (Germany)")
            .And.Contain("Japanese (Japan)")
            .And.Contain("Dutch (Belgium)");
    }

    [Test]
    public void OpenEditorWithLanguageSpecifiedInUrl()
    {
        var page = Preconditions.CreatePage(displayName: PageForUrlTest);
        page.AddVersion("da");

        Context.Pages.Editor.Open(page.itemId, language: "da", site: Constants.SXAHeadlessSite, version: "1", tenantName: Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem.Name
            .Should().Be(page.name);

        Context.Pages.Editor.RightHandPanel.HeaderText.Should().Be(page.name);
        Context.Pages.Editor.TopBar.GetSelectedLanguage().Should().Be("Danish");
        Context.Browser.PageUrl.Should().Contain("sc_lang=da");
    }

    [Test]
    public void UndoAndRedo_Works_InContextOfSpecificLanguage()
    {
        var page = Preconditions.CreatePage(displayName: TestPageUndoRedo);
        page.AddVersion("da");

        // add Title component on the page
        Preconditions.AddComponent(page.itemId, page.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title));
        Preconditions.AddComponent(page.itemId, page.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title), language: "da");

        Preconditions.OpenPageInSiteTree(TestPageUndoRedo);

        // change values for the Title components (En)
        ClearAndFillTextField(EnFirstValue);
        ClearAndFillTextField(EnSecondValue);

        // change language (Da)
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeFalse();

        // change values for the Title components (Da)
        ClearAndFillTextField(DaFirstValue);
        ClearAndFillTextField(DaSecondValue);
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();

        // change language (En)
        Context.Pages.Editor.TopBar.SelectLanguage("English");
        Context.Pages.Editor.EditorHeader.IsUndoActive().Should().BeTrue();

        // Undo to enFirstValue
        /*Undo used twice because ClearAndFillTextField method change field data
         and empty state after Clear also saved.*/
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.CurrentPage.TextInputs.First().Text.Should().Be(EnFirstValue);

        // change language (Da)
        Context.Pages.Editor.TopBar.SelectLanguage("Danish");

        // Undo to daFirstValue
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.EditorHeader.Undo(false);
        Context.Pages.Editor.CurrentPage.TextInputs.First().Text.Should().Be(DaFirstValue);

        // Redo to daSecondValue
        Context.Pages.Editor.EditorHeader.Redo(false);
        Context.Pages.Editor.EditorHeader.Redo(false);
        Context.Pages.Editor.CurrentPage.TextInputs.First().Text.Should().Be(DaSecondValue);

        Context.Pages.Editor.EditorHeader.IsRedoActive().Should().BeFalse();
    }

    [Test]
    public void UserHasNoLanguageWritePermission_LanguageVersionIsNotEditable()
    {
        // create page
        var page = Preconditions.CreatePage(displayName: PageBE);

        // add version
        page.AddVersion("nl-BE");
        Preconditions.AddComponent(page.itemId, page.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.Title), language: "nl-BE");

        // go to page and choose Dutch lang and add a Title component
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(PageBE);

        Context.Pages.Editor.TopBar.SelectLanguage("Dutch");

        // set user no language write access
        var item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE");

        Context.ApiHelper.PlatformGraphQlClient.DenyLanguageWriteAccess(item.itemId, TestRunSettings.UserEmail);

        // refresh
        Context.Pages.Editor.LeftHandPanel.OpenSiteTree();
        Preconditions.OpenPageInSiteTree("Home");
        Preconditions.OpenPageInSiteTree(page.name);

        // check
        Context.Pages.Editor.CurrentPage.isRenderingNotEditable("Title").Should().BeTrue();
    }

    [Test, Category("IgnoredOnStaging")]
    public void UserHasNoLanguageReadPermission_LanguageIsNotAvailable()
    {
        // create page
        var page = Preconditions.CreatePage(displayName: PageFR);

        // add version
        page.AddVersion("fr-FR");

        // go to page and choose French lang and add a Title component
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(PageFR);

        Context.Pages.Editor.TopBar.SelectLanguage("French");

        // set user no language Read access
        var item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/fr-FR");

        Context.ApiHelper.PlatformGraphQlClient.DenyLanguageReadAccess(item.itemId, TestRunSettings.UserEmail);

        // refresh
        Preconditions.OpenPageInSiteTree("Home");
        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        // check that Fr language are not available
        Context.Pages.Editor.TopBar.GetAllLanguages().Should().NotContain("French (France)");

        // go to page specified Fr language in the url
        Context.Pages.Editor.Open(page.itemId, language: "fr", site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // check timed notification warning
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo(Constants.NoHavePermissionToViewTheItem);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().BeEquivalentTo("Version 1");
        Context.Pages.Editor.TopBar.GetSelectedLanguage().Should().Be("English");
    }

    [Test]
    public void UserHasNoReadPermissionToLanguageItem_LanguageIsNotAvailable()
    {
        // create page
        var page = Preconditions.CreatePage(displayName: PageDE);

        // add version
        page.AddVersion("de-DE");

        // go to page and choose French lang and add a Title component
        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(PageDE);

        Context.Pages.Editor.TopBar.SelectLanguage("German");

        // set user no Read access to the language item
        var item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/de-DE");
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(item.itemId, TestRunSettings.UserEmail);

        // refresh
        Preconditions.OpenPageInSiteTree("Home");
        Context.Browser.Refresh();

        // check that Fr language are not available
        Context.Pages.Editor.TopBar.GetAllLanguages().Should().NotContain("German (German)");

        // go to page specified Fr language in the url
        Context.Pages.Editor.Open(page.itemId, language: "de", site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);

        // check timed notification warning
        Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo(Constants.NoHavePermissionToViewTheItem);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.EditorHeader.VersionInfo.Should().BeEquivalentTo("Version 1");
        Context.Pages.Editor.TopBar.GetSelectedLanguage().Should().Be("English");

        Context.Browser.PageUrl.Should().Contain("sc_lang=en")
            .And.Contain("sc_version=1")
            .And.Contain($"sc_site={Constants.SXAHeadlessSite}");
    }

    [Test]
    public void FallbackLanguageFeature_WorksWithQuery_sc_lang()
    {
        // set DE as a fallback language to JP
        var langToFallback = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/ja-JP");
        langToFallback.SetFieldValue("Fallback Language", "de-DE");

        // create page and Enable Item Fallback
        var fallbackPage = Preconditions.CreatePage(displayName: FallBackPage);
        fallbackPage.AddVersion("de-DE");
        fallbackPage.SetFieldValue("__Enable item fallback", "1");

        // enable language fallback for a site
        var site = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsSiteGroupingPath);
        site.SetFieldValue("ItemLanguageFallback", "1");
        site.SetFieldValue("FieldLanguageFallback", "1");

        // add RTE component
        Preconditions.AddComponent(fallbackPage.itemId, fallbackPage.path, DefaultScData.RenderingId(DefaultScData.SxaRenderings.RichText), language: "de-DE");

        Preconditions.OpenSXAHeadlessSite();
        Preconditions.OpenPageInSiteTree(FallBackPage);

        // change language
        Context.Pages.Editor.TopBar.SelectLanguage("German");

        // change field content to DE
        Context.Pages.Editor.CurrentPage.TextInputs[0].Text = "DE Content";
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();

        // change RE field for DE language

        Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite, pageId: fallbackPage.itemId, language: "ja-JP", tenantName: Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.TopBar.GetSelectedLanguage().Should().Be("Japanese (Japan)");

        // check layout RTE field has DE value
        Context.Pages.Editor.CurrentPage.TextInputs[0].InnerHTML.Should().Contain("DE Content");
    }

    [Test]
    public void PageOpensWithDefaultLanguage_Without_sc_lang_query()
    {
        // enable default language for a site
        var site = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsSiteGroupingPath);
        site.SetFieldValue("Language", "de-DE");

        Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite, language: "en", tenantName: Context.TestTenant);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Context.Pages.Editor.Open(site: Constants.SXAHeadlessSite, tenantName: Context.TestTenant);
        /*
         *Below wait will run until timeout because of bug: https://sitecore.atlassian.net/browse/PGS-4172
         *The method still need to be invoked to set the uiTestsPageCustomProperty.
         */
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

        Context.Pages.Editor.TopBar.GetSelectedLanguage().Should().Be("German (Germany)");
    }

    [TearDown]
    public void SetEnglishVersion()
    {
        if (TestContext.CurrentContext.Test.Name == nameof(FallbackLanguageFeature_WorksWithQuery_sc_lang))
        {
            var site = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsSiteGroupingPath);
            site.SetFieldValue("ItemLanguageFallback", "0");
            site.SetFieldValue("FieldLanguageFallback", "0");
        }

        if (TestContext.CurrentContext.Test.Name == nameof(PageOpensWithDefaultLanguage_Without_sc_lang_query))
        {
            var site = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SxaHeadlessSiteSettingsSiteGroupingPath);
            site.SetFieldValue("Language", "en");
        }
    }

    [OneTimeTearDown]
    public void DeleteLanguages()
    {
        if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
        {
            List<string> languageItems = new List<string>();
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/fr-FR").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/de-DE").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE").itemId);
            languageItems.Add(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/ja-JP").itemId);
            Context.ApiHelper.PlatformGraphQlClient.RemoveSupportedLanguagesFromSiteSettings(SiteSettingsItem, languageItems);

            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(null, "/sitecore/system/Languages/de-DE");
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(null, "/sitecore/system/Languages/fr-FR");
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(null, "/sitecore/system/Languages/nl-BE");
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(null, "/sitecore/system/Languages/ja-JP");
        }
        else
        {
            XMAppsApi xmAppsApi = new(TestRunSettings.XMAppsApi);
            var siteId = Context.Sites.Find(s => s.name.Equals(Constants.SXAHeadlessSite)).id;
            List<string> supportedLanguages = new List<string>
            {
                "en",
                "da"
            };
            xmAppsApi.UpdateSiteLanguages(siteId, supportedLanguages);
            var item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/fr-FR");
            Context.ApiHelper.PlatformGraphQlClient.AllowLanguageReadAccess(item.itemId, TestRunSettings.UserEmail);

            item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE");
            Context.ApiHelper.PlatformGraphQlClient.AllowLanguageWriteAccess(item.itemId, TestRunSettings.UserEmail);
            item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/de-DE");
            Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(item.itemId, TestRunSettings.UserEmail);
        }

        Context.Browser.Refresh();
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    private static void ClearAndFillTextField(string text)
    {
        Context.Pages.Editor.CurrentPage.ClearAndFillTextField(text);
        Context.Pages.Editor.EditorHeader.WaitUntilAutoSaveAtInactivity();
    }
}
