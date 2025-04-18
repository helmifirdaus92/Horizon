// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using NUnit.Framework;
using NUnit.Framework.Interfaces;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers;
using Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.HelperClasses.Security;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers;
using Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Browser;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL;
using TechTalk.SpecFlow;
using UTF;
using UTF.HelperWebService;
using ApiSettings = Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Settings;
using Constants = Sitecore.Horizon.Integration.Tests.Ui.Wrappers.Data.Constants;
using Extensions = UTF.Extensions;
using TestData = Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers.Data.TestData;

namespace Sitecore.Horizon.Integration.Editor.Tests.UI.Helpers
{
    [Binding]
    public sealed class TestsSetup
    {
        private const string IgnoreConsoleErr = "IgnoreConsoleErr";
        private static bool _hasIgnoreConsoleErrTag;
        private readonly ScenarioContext _scenarioContext;
        private Exception _exceptionToFailTest;

        public TestsSetup(ScenarioContext scenarioContext)
        {
            _scenarioContext = scenarioContext;
        }

        private bool TestHasIgnoreConsoleErrorsTag => _scenarioContext.ScenarioInfo.Tags.Contains(IgnoreConsoleErr) || _hasIgnoreConsoleErrTag;

        [BeforeTestRun]
        public static void InitHelpers()
        {
            try
            {
                Context.ApiHelper = ApiManager.GetApiHelper("CM", 30000);
                Context.EdgeGraphQlClient = new EdgeGraphQlClient(Settings.EdgeQraphQlApiUrl, Settings.EdgeQraphQlApiKey);
                Context.Horizon = UiManager.Init(Settings.BrowserName, Settings.Instances.Cm, Settings.Instances.HorizonClient, Settings.HorizonAppPath,
                    Settings.UseHeadlessMode, Settings.BrowserWidth, Settings.BrowserHeight);

                //important to keep this for first time loading after sitecore instance has been deployed
                string apiUrl = Settings.Instances.Cm + "/sitecore/shell/Applications/Content Editor";
                using (var client = new HttpClient())
                {
                    client.Timeout = TimeSpan.FromMinutes(5);
                    client.BaseAddress = new Uri(apiUrl);
                    client.GetAsync(apiUrl).Wait();
                }

                ApiSettings.FetchToken();
                Context.HorizonGraphQlClient = new GraphQlHorizon(Settings.Instances.Cm + "/sitecore");
                Context.PlatformGraphQlClient = new GraphQLPlatform(Settings.Instances.Cm + "/sitecore");
                Context.ApiHelper.Items.AddDanishLanguage();

                Context.User = new User(Settings.AuthorUser.UserName, Settings.AuthorUser.Password, new string[]
                {
                })
                {
                    FullName = Settings.AuthorUser.FullName
                };
                Context.Horizon.LogInToBackend(Context.User.FullUserName, Context.User.Password);
                Context.Preview = Context.Horizon.Preview;
                Context.Editor = Context.Horizon.Editor;
                Context.PageTemplates = Context.Horizon.PageTemplates;
                Context.PageDesigns = Context.Horizon.PageDesigns;
                Context.PartialDesigns = Context.Horizon.PartialDesigns;
                Context.PartialDesignEditor = Context.Horizon.PartialDesignEditor;
                Context.PageDesignEditor = Context.Horizon.PageDesignEditor;
                Context.SetUserRoles(Settings.AuthorUser.UserName, new List<string>()
                {
                    "sitecore\\Sitecore Client Advanced Publishing",
                    "sitecore\\Designer",
                    "sitecore\\Author"
                });

                SetUserLevelPermissionsToSiteStartItems(Context.User.FullUserName);
                

                // Force inventory to be in disconnected mode,
                // if we directly browse app, tenant will be already resolved in connected mode, even before we set the mode
                Context.Horizon.Browser.Navigate($"{Settings.Instances.HorizonClient}/extensions/shell-root?organization={Settings.OrganizationId}&tenantName=horizon-local-xm-cloud-instance");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.InventoryDisconnectedMode', true);");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.DisconnectedMode', true);");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Horizon.AppSwitcherDevMode', true);");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.FeaaSDisabled', true);");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.GainsightDisabled', true);");
                Context.Horizon.Browser.ExecuteJavaScript("localStorage.setItem('Sitecore.Pages.ElasticApmDisabled', true);");
                Context.Horizon.Browser.ExecuteJavaScript($"localStorage.setItem('pages:org_id','{Settings.OrganizationId}');");

                Logger.WriteLineWithTimestamp("Open Editor after local storage variables are set");
                Context.Editor.Open(site: Constants.SXAHeadlessSite);
                Logger.WriteLineWithTimestamp("Sxa site loaded " + Context.Editor.PageUrl.Contains(Constants.SXAHeadlessSite).ToString());
            }
            catch (Exception exception)
            {
                Logger.WriteLineWithTimestamp("init failed. Exception: " + exception);
                Context.Horizon.Browser.TakeScreenshot("EditorTestsSetupFailed");
                Context.Horizon.Browser.CheckIfErrorsExistInConsole();
                Context.Horizon.Terminate();
                throw;
            }

            // Populate schemes and rebuild 'sitecore_master_index'
            if (!Settings.IsLocalRun)
            {
                RebuildRequiredIndexes();
            }
        }

        [AfterTestRun]
        public static void TerminateAndDeleteTestData()
        {
            TestData.ClearItems(false);
            TestData.ClearFiles(false);
            if (!Settings.IsLocalRun)
            {
                PublishEmptySiteAfterTestRun();
            }

            Context.ApiHelper.Security.DeleteUsers();
            Context.Horizon.Terminate();
        }

        [BeforeFeature]
        [Scope(Tag = "MultiBrowser_Firefox")]
        public static void BeforeFeature(FeatureContext featureContext)
        {
            _hasIgnoreConsoleErrTag = featureContext.FeatureInfo.Tags.Contains(IgnoreConsoleErr);
            TerminateAndDeleteTestData();
            BrowserHelper.ChangeBrowser(BrowserName.Firefox);
            InitHelpers();
        }

        [AfterFeature]
        [Scope(Tag = "MultiBrowser_Firefox")]
        public static void AfterFeature()
        {
            TerminateAndDeleteTestData();
            BrowserHelper.RestoreBrowserToDefault();
            InitHelpers();
        }

        [BeforeScenario]
        public void StartLogCollecting()
        {
            if (TestHasIgnoreConsoleErrorsTag)
            {
                return;
            }

            Context.Horizon.Browser.StartConsoleErrorCollection();
        }

        [AfterScenario(Order = 10000)]
        public void DeleteTestData()
        {
            ReportErrorsIfAny();
            TestData.ClearItems();
            TestData.ClearFiles();

            Context.Horizon.Browser.CloseAllTabsExceptRoot();

            //important to throw exception at the very end of test to make sure that items created by tests has been removed
            if (_exceptionToFailTest != null)
            {
                throw _exceptionToFailTest;
            }
        }

        private static void SetUserLevelPermissionsToSiteStartItems(string userName)
        {
            //SXA start item
            Context.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(TestConstants.SXASiteItemID, userName);

            //SXA Shared start item
            Context.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(TestConstants.SXASharedSiteItemID, userName);

            //Website start item
            Context.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(TestConstants.WebSiteHomeItemID, userName);
        }

        private static void RebuildRequiredIndexes()
        {
            try
            {
                UTF.Context.HelperService.PopulateSolrSchemaForIndex("sitecore_master_index");
                UTF.Context.HelperService.RebuildCustomIndex("sitecore_master_index");
            }
            catch (Exception e)
            {
                Logger.WriteLineWithTimestamp("Rebuilding has failed: " + e);
            }
        }

        private static void PublishEmptySiteAfterTestRun()
        {
            var originalTimeout = UTF.Context.Settings.WaitTimeout;
            UTF.Context.Settings.WaitTimeout = 60000 * 5;
            UTF.Context.HelperService.PublishSite(PublishMode.Full, "en");
            UTF.Context.Settings.WaitTimeout = originalTimeout;
        }

        private void ReportErrorsIfAny()
        {
            bool testScenarioPassed = TestContext.CurrentContext.Result.Outcome.Status != TestStatus.Failed;
            if (testScenarioPassed)
            {
                bool errorsAreAbsentInConsole = !Context.Horizon.Browser.CheckIfErrorsExistInConsole();
                if (errorsAreAbsentInConsole || TestHasIgnoreConsoleErrorsTag)
                {
                    return;
                }

                _exceptionToFailTest = new Exception("Test scenario has passed but errors appeared in console.");
            }

            if (Settings.MakeScreenshotOnFailure)
            {
                var testContext = TestContext.CurrentContext.Test;
                var testName = testContext.FullName;
                Context.Horizon.Browser.TakeScreenshot(testName);
            }
        }
    }
}
