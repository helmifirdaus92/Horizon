// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using NUnit.Framework;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Components.TimedNotification;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Controls;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages;
using static Sitecore.Pages.E2EFramework.UI.Tests.Helpers.Data.DefaultScData;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features;

[TestFixture]
public class UserWithRestrictedAccess : BaseFixture
{
    [OneTimeSetUp]
    public void SetUserAccessForTheTenant()
    {
        if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
        {
            return;
        }

        var identityApi = new IdentityApi(TestRunSettings.IdentityApi);
        var members = identityApi.GetMembers().data;

        var users = new List<string>
        {
            TestRunSettings.UserNoStartPageAccessEmail,
            TestRunSettings.UserNoSiteAccessEmail,
            TestRunSettings.UserNoLanguageAccessEmail,
            TestRunSettings.UserNoLanguageWriteEmail
        };

        foreach (var userEmail in users)
        {
            var user = members.Find(m => m.email.Equals(userEmail));
            if (user != null)
            {
                var managementIdentityApi = new IdentityApi($"{TestRunSettings.IdentityApi}");
                managementIdentityApi.SetUserRoleForTenantId(user, Context.TestTenantId, TestRunSettings.OrganizationId);
            }
        }
    }

    [OneTimeTearDown]
    public void LoginBackAsTestUser()
    {
        Context.Pages.Logout();
        Context.LoginPage.Login(TestRunSettings.UserEmail, TestRunSettings.UserPassword, TestRunSettings.StartUrl);
        Context.Browser.GoToUrl(new Uri($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}"));
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
    }

    [Test]
    public void NoReadAccess_ToStartSitePage_SiteIsNotVisible()
    {
        LogoutAndLoginAsUser(TestRunSettings.UserNoStartPageAccessEmail, TestRunSettings.UserWithLimitedAccessPassword);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        List<string> siteNames = TestRunSettings.RunTestsEnv.Equals("LocalCM")
            ? Context.ApiHelper.PlatformGraphQlClient.GetSites().Select(s => s.name).ToList()
            : Context.XMAppsApi.GetSites().Select(s => s.displayName != "" ? s.displayName : s.name).ToList();

        Item item = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.EmptySiteHomePagePath);
        Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(item.itemId, TestRunSettings.UserNoStartPageAccessEmail);

        Item homePageEmptySite = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.EmptySiteHomePagePath);

        try
        {
            Context.Browser.WaitForHorizonIsStable();
            Context.Pages.Editor.Open(homePageEmptySite.itemId, site: Constants.EmptySite, tenantName: Context.TestTenant, waitForCanvasLoad: false);
            Context.Pages.Editor.TimedNotification.Message.Should().BeEquivalentTo(Constants.NoHavePermissionToViewTheItem);

            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Context.Pages.Editor.TopBar.GetSelectedSite().Should().NotBe(Constants.EmptySite);

            List<string> allSites = Context.Pages.Editor.TopBar.OpenSitesDropdown().GetAllSites();
            List<string> siteNamesWithoutEmptySite = siteNames.Where(s => s != Constants.EmptySite).ToList();
            allSites.Should().HaveCount(siteNamesWithoutEmptySite.Count);
            allSites.Should().Contain(siteNamesWithoutEmptySite);
        }
        finally
        {
            Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(item.itemId, TestRunSettings.UserNoStartPageAccessEmail);
            Context.Pages.Editor.Open(homePageEmptySite.itemId, site: Constants.EmptySite, tenantName: Context.TestTenant);
        }
    }

    [Test]
    public void User_HasNoAccess_ToAnySite()
    {
        LogoutAndLoginAsUser(TestRunSettings.UserNoSiteAccessEmail, TestRunSettings.UserWithLimitedAccessPassword);

        try
        {
            List<Site> sites = Context.ApiHelper.PlatformGraphQlClient.GetSites();
            foreach (var site in sites)
            {
                Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(site.startItem.itemId, TestRunSettings.UserNoSiteAccessEmail);
            }

            Context.Browser.GoToUrl(new Uri($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}"));

            TimedNotification notification = Context.Pages.Editor.TimedNotification;
            notification.Type.Should().BeEquivalentTo(NotificationType.Error);
            notification.Message.Should().BeEquivalentTo(Constants.NoSitesAvailableErrMsg);
        }
        finally
        {
            List<Site> sites = Context.ApiHelper.PlatformGraphQlClient.GetSites();
            foreach (var site in sites)
            {
                Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(site.startItem.itemId, TestRunSettings.UserNoSiteAccessEmail);
            }
        }
    }

    [Test]
    [Ignore ("")]
    [Category("InvestigationReqForStagingConfig")] // This won't be fixed, Test case to be deleted once switched to staging XM as standard practise
    public void User_HasNoAccess_ToAnyLanguage()
    {
        LogoutAndLoginAsUser(TestRunSettings.UserNoLanguageAccessEmail, TestRunSettings.UserWithLimitedAccessPassword);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        try
        {
            Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/en").itemId, TestRunSettings.UserNoLanguageAccessEmail);
            Context.ApiHelper.PlatformGraphQlClient.DenyReadAccess(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/da").itemId, TestRunSettings.UserNoLanguageAccessEmail);

            Context.Browser.GoToUrl(new Uri($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}"));

            TimedNotification notification = Context.Pages.Editor.TimedNotification;
            notification.Type.Should().BeEquivalentTo(NotificationType.Warning);
            notification.Message.Should().BeEquivalentTo(Constants.NoHavePermissionToViewTheItem);
        }
        finally
        {
            Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/en").itemId, TestRunSettings.UserNoLanguageAccessEmail);
            Context.ApiHelper.PlatformGraphQlClient.AllowReadAccess(Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/da").itemId, TestRunSettings.UserNoLanguageAccessEmail);
        }
    }

    [Test]
    public void Rename_ShouldNotBeAvailable_WhenUserHasNoLanguageWriteAccess()
    {
        LogoutAndLoginAsUser(TestRunSettings.UserNoLanguageWriteEmail, TestRunSettings.UserWithLimitedAccessPassword);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        var siteSettingsItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.EmptySiteSettingsPath);
        try
        {
            Context.ApiHelper.PlatformGraphQlClient.AddLanguage("nl", "BE");
            var dutchLangItemId = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE").itemId;
            Context.ApiHelper.PlatformGraphQlClient.AddSupportedLanguagesToSiteSettings(siteSettingsItem, dutchLangItemId);
            Context.ApiHelper.PlatformGraphQlClient.DenyLanguageWriteAccess(dutchLangItemId, TestRunSettings.UserNoLanguageWriteEmail);

            Context.Browser.Refresh();
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();

            Item testPage = Preconditions.CreatePage(parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.EmptySiteHomePagePath).itemId);

            Context.ApiHelper.PlatformGraphQlClient.AddItemVersion(testPage.path, "nl-BE");
            Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
            Context.Pages.Editor.TopBar.SelectLanguage("Dutch");

            // check that Display name is disabled
            PageDetailsDialog pageDetails = Context.Pages.Editor.LeftHandPanel.SiteContentTree.SelectedItem
                .InvokeContextMenu().InvokePageDetailsDialog();
            pageDetails.IsDisplayNameEnabled.Should().BeFalse();
        }
        finally
        {
            Item item = Context.ApiHelper.PlatformGraphQlClient.GetItem("/sitecore/system/Languages/nl-BE");
            Context.ApiHelper.PlatformGraphQlClient.RemoveSupportedLanguagesFromSiteSettings(siteSettingsItem, item.itemId);
            Context.ApiHelper.PlatformGraphQlClient.DeleteItem(item.itemId);
        }
    }

    [Test]
    public void Page_CannotBePublished_WhenUserNotHaveRole()
    {
        LogoutAndLoginAsUser(TestRunSettings.UserNoLanguageAccessEmail, TestRunSettings.UserWithLimitedAccessPassword);
        Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        Item testPage = Preconditions.CreatePage(parentId: Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.EmptySiteHomePagePath).itemId);
        Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(testPage.itemId, "__Workflow State", WorkflowInfo.SampleWorkflow.WorkflowStateApproved);
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.RefreshTreeAtRootItem();
        Context.Pages.Editor.LeftHandPanel.SiteContentTree.GetItemByPath(testPage.name).Select();

        Context.Pages.TopBar.WorkflowBar.PublishButton.IsDisabled.Should().BeTrue();
        Context.Pages.TopBar.WorkflowBar.PublishButton.Container.Hover();
        Context.Pages.TopBar.WorkflowBar.PublishButton.OverlayInfoText.Should().BeEquivalentTo("You do not have permissions to publish this page");
    }

    private void LogoutAndLoginAsUser(string login, string password)
    {
        Context.Pages.Logout();
        Context.LoginPage.Login(login, password, TestRunSettings.StartUrl);
        Context.LoginPage.SelectTestTenant(TestRunSettings.ProjectName, TestRunSettings.EnvironmentName);
    }
}
