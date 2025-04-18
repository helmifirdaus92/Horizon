// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Net;
using NUnit.Framework;
using RestSharp;
using Serilog;
using Sitecore.E2E.Test.Framework;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Deploy;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Inventory;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Requests;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types;
using Sitecore.Pages.E2EFramework.UI.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.Wrappers.Pages;
using Settings = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Settings;

namespace Sitecore.Pages.E2EFramework.UI.Tests
{
    [SetUpFixture]
    public class TestsSetup : TestBase
    {
        static readonly string EmptySite = "EmptySite";
        static readonly string EmptySiteTemplate = "{2867D289-8951-458A-AF19-CE93A67BB494}";
        static readonly string StaticCollection = "TestCollectionLocalRun";
        private static InventoryApi inventoryApi;
        private static DeployApi deployApi;
        private static XMAppsApi xmAppsApi;
        static string LocalTenant = "local-xm-cloud-instance";
        static GetTenantsResponse.TenantData testTenant;

        [OneTimeSetUp]
        public void Init()
        {
            Logger.InternalLogger = new LoggerConfiguration()
                .WriteTo.NUnitOutput()
                .CreateLogger();

            /*
             * Identify Tenant and CM URL based on the test running environment
             */
            if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
            {
                Context.TestTenant = TestRunSettings.TenantName;
                Context.LocalTenant = LocalTenant;
                Context.CmUrl = TestRunSettings.CmUrl;
                Context.EdgeClientId = TestRunSettings.EdgeClientId;
                Context.EdgeClientSecret = TestRunSettings.EdgeClientSecret;
                Context.SXAHeadlessSite = "SXAHeadlessSite";
                Context.SharedSite = "Shared site";
                Context.SXAHeadlessTenant = "SXAHeadlessTenant";
                Context.ApiHelper = new ApiHelper(Context.CmUrl + "/sitecore");
            }
            else
            {
                /*
                 * Fetching tenant information from Inventory service
                 */
                inventoryApi = new InventoryApi(TestRunSettings.InventoryApi);
                xmAppsApi = new XMAppsApi(TestRunSettings.XMAppsApi);
                testTenant = inventoryApi.GetTenants().data.Find(tenant => tenant.annotations.XMCloudProjectName.Equals(TestRunSettings.ProjectName)
                    &&
                    tenant.annotations.XMCloudEnvironmentName.Equals(TestRunSettings.EnvironmentName));
                Settings.TenantId = testTenant.id;
                Settings.FetchTenantToken(TestRunSettings.OrganizationId);
                Context.TestTenant = testTenant.name;
                Context.TestTenantId = testTenant.id;
                Context.CmUrl = testTenant.annotations.URL.Replace("/sitecore", "/");
                Context.XmCloudEnvironmentId = testTenant.annotations.XMCloudEnvironmentId;
                Context.XmCloudProjectId = testTenant.annotations.XMCloudProjectId;
                Context.ApiHelper = new ApiHelper(Context.CmUrl + "sitecore");
                Context.XMAppsApi = xmAppsApi;

                Member memberDetails = new IdentityApi(TestRunSettings.IdentityApi).GetMembers().data.Find(m => m.email.Equals(TestRunSettings.UserEmail));
                SetUserAccessForTenant(memberDetails, testTenant.id);
                switch (TestRunSettings.RunTestsOnStaticSite)
                {
                    case false:

                        deployApi = new DeployApi(TestRunSettings.DeployApi);
                        var edgeCredentials = deployApi.GenerateEdgeClient(Context.XmCloudEnvironmentId, Context.XmCloudProjectId);
                        Context.EdgeClientId = edgeCredentials.clientId;
                        Context.EdgeClientSecret = edgeCredentials.clientSecret;

                        string siteNamePostFix = GeneratePostfix();
                        Context.SiteCollection = CreateTestCollection("CITestsCollection" + siteNamePostFix);
                        Context.SXAHeadlessSite = "TestSite" + siteNamePostFix;
                        Context.SharedSite = "TestSiteShared" + siteNamePostFix;
                        Context.SXAHeadlessTenant = Context.SiteCollection.name;
                        break;
                    case true:
                        /*
                         * 1. Make sure the user in config has access to the organization and also the tenant.
                         * 2. Make sure the edge credentials in config are tied to the test tenant.
                         */
                        Context.EdgeClientId = TestRunSettings.EdgeClientId;
                        Context.EdgeClientSecret = TestRunSettings.EdgeClientSecret;

                        Context.SiteCollection = xmAppsApi.GetCollections().Find(c => c.name.Equals(StaticCollection)) ?? CreateTestCollection(StaticCollection);
                        Context.SXAHeadlessSite = TestRunSettings.StaticSiteForLocalRun;
                        Context.SharedSite = TestRunSettings.StaticSiteForLocalRun + " shared";
                        Context.SXAHeadlessTenant = Context.SiteCollection.name;
                        break;
                }

                CreateTestSiteInCollectionIfNotPresent(Context.SXAHeadlessSite, Context.SiteCollection.id);
                CreateTestSiteInCollectionIfNotPresent(Context.SharedSite, Context.SiteCollection.id, true);
                Context.Sites = xmAppsApi.GetSites();
                AddCustomComponentToAllowedRenderingsInTestSite();
                CreateCustomPageTemplate();
            }

            CreateAnEmptySite();

            OpenBrowser(incognito: true);
            Driver.Manage().Window.Maximize();
            Driver.Navigate().GoToUrl(Context.CmUrl + "/sitecore/shell");
            Context.Browser = new BrowserWrapper(Driver);
            Context.LoginPage = new LoginPage(Driver);
            Context.LoginPage.Login(TestRunSettings.UserEmail, TestRunSettings.UserPassword, TestRunSettings.StartUrl);
            /*
             * Update User access after first time login
             */
            SetUserLevelPermissionsToSiteStartItems(TestRunSettings.UserEmail);
            /*
             * If test is run on a different tenant other than the one prepared with deploy scripts
             * the below role setting will fail with username validation rules,
             * So, In that case user roles needs to set up manually.
             *
             */
            SetUserRoles(TestRunSettings.UserEmail, new List<string>()
            {
                "sitecore\\Sitecore Client Advanced Publishing",
                "sitecore\\Designer",
                "sitecore\\Author"
            });

            Driver.Navigate().GoToUrl($"{TestRunSettings.StartUrl}?organization={TestRunSettings.OrganizationId}&tenantName={Context.TestTenant}");
            Thread.Sleep(5000); //Wait 5s for tenant resolution before refreshing browser with local storage variables.

            if (TestRunSettings.RunTestsEnv.Equals("LocalCM"))
            {
                Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.InventoryDisconnectedMode', true);");
            }

            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.DisconnectedMode', true);");
            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.IsLocalXM', true);");
            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.AppSwitcherDevMode', true);");
            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.FeaaSDisabled', true);");
            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.GainsightDisabled', true);");
            Driver.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.ElasticApmDisabled', true);");
            Driver.ExecuteJavaScript($"localStorage.setItem('pages:org_id','{TestRunSettings.OrganizationId}');");
            Driver.Navigate().Refresh();
            Context.Pages = new Wrappers.Pages.Pages(Driver, TestRunSettings.StartUrl);
            Context.Pages.Editor.WaitForNewPageInCanvasLoaded();
        }

        [OneTimeTearDown]
        public void TearDown()
        {
            if (!TestRunSettings.RunTestsEnv.Equals("LocalCM") && !TestRunSettings.RunTestsOnStaticSite)
            {
                var identityAdminApi = new IdentityAdminApi($"{TestRunSettings.IdentityApi}/api/identity/");

                deployApi = new DeployApi(TestRunSettings.DeployApi);
                deployApi.DeleteEdgeClient(Context.XmCloudEnvironmentId, Context.EdgeClientId);
                xmAppsApi.DeleteCollection(Context.SiteCollection.id);
            }

            if (Context.Browser != null)
            {
                CloseBrowser();
            }
        }

        internal static void SetUserAccessForTenant(Member memberDetails, string tenantId)
        {
            var managementIdentityApi = new IdentityApi($"{TestRunSettings.IdentityApi}");
            managementIdentityApi.SetUserRoleForTenantId(memberDetails, tenantId, TestRunSettings.OrganizationId);
        }

        private static void CreateAnEmptySite()
        {
            if (!Context.ApiHelper.PlatformGraphQlClient.GetSites().Any(s => s.name.Equals(EmptySite)))
            {
                Context.ApiHelper.PlatformGraphQlClient.CreateSiteAsync(EmptySite, EmptySiteTemplate);
            }
        }

        private static void SetUserLevelPermissionsToSiteStartItems(string userName)
        {
            if (!TestRunSettings.RunTestsEnv.Equals("LocalCM"))
            {
                xmAppsApi.WaitForCondition(xm =>
                {
                    var siteList = xm.GetSites().Select(s => s.name).ToList();
                    return siteList.Contains(Context.SXAHeadlessSite) && siteList.Contains(Context.SharedSite);
                });
                var sites = xmAppsApi.GetSites();
                Constants.SXASiteItemID = sites.Find(s => s.name.Equals(Context.SXAHeadlessSite)).id;
                Constants.SXASharedSiteItemID = sites.Find(s => s.name.Equals(Context.SharedSite)).id;
            }

            //SXA site item
            Context.ApiHelper.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(Constants.SXASiteItemID, userName);

            //SXA Shared site item
            Context.ApiHelper.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(Constants.SXASharedSiteItemID, userName);

            //Website home item
            Context.ApiHelper.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(Constants.WebSiteHomeItemID, userName);

            //Templates item
            Context.ApiHelper.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(Constants.TemplatesItemId, userName);
        }

        private static void SetUserRoles(string emailAddress, List<string> roles)
        {
            var user = Context.ApiHelper.PlatformGraphQlClient.GetUsers().Find(u =>
                u.profile.email != null && u.profile.email.Equals(emailAddress));
            if (user != null)
            {
                Context.ApiHelper.PlatformGraphQlClient.UpdateUser(user.profile.userName, roles);
            }
        }

        private static void SetSiteAsSharedInCollection(string collectionId, string siteId)
        {
            xmAppsApi.SetSiteAsShared(siteId);
        }

        private static void AddCustomComponentToAllowedRenderingsInTestSite()
        {
            var availableRenderings = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.AvailableRenderingsPath);
            var customComponents =
                Context.ApiHelper.PlatformGraphQlClient.GetItem(availableRenderings.path + "/Custom Components") ??
                Context.ApiHelper.PlatformGraphQlClient.CreateItem("Custom Components",
                    parent: availableRenderings.itemId, templateId: Constants.AvailableRenderingsTemplateId);
            Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(customComponents.itemId, "Renderings", $"{Constants.CustomRenderingId}|{Constants.CustomPageContentRenderingId}");
        }

        private static string GeneratePostfix()
        {
            return Guid.NewGuid().ToString().Substring(0, 5);
        }

        private static Collection CreateTestCollection(string collectionName)
        {
            var collectionCreationStatus = xmAppsApi.CreateCollection(collectionName);
            if (collectionCreationStatus == ResponseStatus.Error)
            {
                throw new Exception("Collection creation failed!...");
            }

            xmAppsApi.WaitForCondition(xm => xm.GetCollections().Any(c => c.name.Equals(collectionName)), TimeSpan.FromMinutes(3), 500, message: $"Collection {collectionName} is not available after 3 minutes......");
            Thread.Sleep(5000); //This waitTime is required to avoid the tenant template issues.
            return xmAppsApi.GetCollections().Find(c => c.name.Equals(collectionName));
        }

        private static Site CreateTestSiteInCollectionIfNotPresent(string siteName, string collectionId, bool shared = false)
        {
            var sites = xmAppsApi.GetSitesInCollection(collectionId);
            if (sites.Any(s => s.name.Equals(siteName)))
            {
                return sites.Find(s => s.name.Equals(siteName));
            }

            List<CreateSite.PosMapping> posMappings = new()
            {
                new CreateSite.PosMapping()
                {
                    language = "en",
                    name = "en" + Context.SXAHeadlessSite,
                }, new CreateSite.PosMapping()
                {
                    language = "da",
                    name = "da" + Context.SXAHeadlessSite,
                }
            };
            xmAppsApi.CreateSiteInCollection(siteName, collectionId: collectionId, postMapping: posMappings);
            xmAppsApi.WaitForCondition(xm => xm.GetJobs().Find(j => j.site.Equals(siteName)).done, TimeSpan.FromMinutes(3), 500, message: $"Test Site {siteName} not available after 3 minutes......");
            xmAppsApi.WaitForCondition(x=>x.GetSitesInCollection(collectionId).Any(s=>s.name.Equals(siteName)));
            sites = xmAppsApi.GetSitesInCollection(collectionId);
            if (shared)
            {
                SetSiteAsSharedInCollection(collectionId, sites
                    .Find(s => s.name.Equals(siteName)).id);
            }

            return sites.Find(s => s.name.Equals(siteName));
        }

        private static void CreateCustomPageTemplate()
        {
            bool templateExists = Context.ApiHelper.PlatformGraphQlClient.ItemTemplateExists(
                Constants.TemplatesFolderPath.Replace("/sitecore/templates/", "") + "/" + Constants.TemplateWithAllFieldsName);

            if (templateExists)
            {
                return;
            }
            else
            {
                string templateRootId = new Guid(Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.TemplatesFolderPath).itemId).ToString();

                var newTemplate = Context.ApiHelper.PlatformGraphQlClient.CreateTemplateWithAllFields(
                    Constants.TemplateWithAllFieldsName,
                    templateRootId,
                    new[] {
                        "47151711-26CA-434E-8132-D3E0B7D26683",
                        "371D5FBB-5498-4D94-AB2B-E3B70EEBE78C",
                        "F39A594A-7BC9-4DB0-BAA1-88543409C1F9",
                        "6650FB34-7EA1-4245-A919-5CC0F002A6D7",
                        "4414A1F9-826A-4647-8DF4-ED6A95E64C43"
                    });
                string templateId = newTemplate.createItemTemplate.itemTemplate.templateId;

                //update insert options for __Standard Values for Page template
                string pageStandardValuesItemId = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.TemplatePageStandardValuesPath).itemId;
                Context.ApiHelper.PlatformGraphQlClient.UpdateItemField(
                    new Guid(pageStandardValuesItemId).ToString(),
                    "__masters",
                    $"{Constants.TemplatePageId}|{Constants.RedirectItemId}|{new Guid(templateId)}");
            }
        }
    }
}
