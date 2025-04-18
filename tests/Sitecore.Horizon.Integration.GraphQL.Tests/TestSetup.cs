// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using NUnit.Framework;
using Serilog;
using Sitecore.Horizon.Integration.GraphQL.Tests.Helpers;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;

namespace Sitecore.Horizon.Integration.GraphQL.Tests;

[SetUpFixture]
public class TestSetup
{
    public static ILogger Logger;

    [OneTimeSetUp]
    public virtual void TestsInit()
    {
        Logger = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .WriteTo.Console()
            .WriteTo.NUnitOutput()
            .CreateLogger();

        Logger.Information("Test init OneTimeSetUp STARTS");
        Context.ApiHelper = new ApiHelper(TestSettings.CmUrl + "/sitecore");

        // create basic site
        // if it is needed to create a site
        if (TestSettings.RunLocal == false)
        {
            string siteName = "PagesApiTestSite" + GeneratePostfix();
            Context.SXAHeadlessTenant = siteName;
            Context.SXAHeadlessSite = siteName;
            CreateSite(Constants.SXAHeadlessSite);
            Settings.UserAccessToken = Settings.AccessToken;
        }

        // if tests run against local environment
        else
        {
            Context.SXAHeadlessTenant = "SXAHeadlessTenant";
            Context.SXAHeadlessSite = "SXAHeadlessSite";

            Settings.FetchUserToken(organizationId: TestSettings.OrganizationId);
            SetUserLevelPermissionsToSiteStartItem(TestSettings.UserEmail);
        }

        Logger.Information("Test init OneTimeSetUp ENDS");
    }

    [OneTimeTearDown]
    public void GlobalTeardown()
    {
        if (TestSettings.RunLocal == false)
        {
            var collection = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SXAHeadlessTenantPath);

            if (collection != null)
            {
                Logger.Information($"Remove {collection.name} collection.");

                Context.ApiHelper.PlatformGraphQlClient.DeleteItem(collection.itemId);
            }
        }

        (Logger as IDisposable)?.Dispose();
    }

    private static string GeneratePostfix()
    {
        return Guid.NewGuid().ToString().Substring(0, 5);
    }

    private static void SetUserLevelPermissionsToSiteStartItem(string userName)
    {
        var homePageItem = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.HomePagePath);

        //Test site start item
        Context.ApiHelper.PlatformGraphQlClient.SetCRUDAccessToItemAndDescendants(homePageItem.itemId, userName);
    }

    private void CreateSite(string siteName)
    {
        Logger.Information($"Starting to create site - {siteName}");

        try
        {
            Logger.Information("Fetching existing sites...");
            var sites = Context.ApiHelper.PlatformGraphQlClient.GetSites();

            if (sites == null)
            {
                Logger.Warning("Failed to fetch sites, the returned list is null.");
            }
            else if (sites.Any(s => s.name.Equals(siteName)))
            {
                Logger.Information($"Site {siteName} already exists. Exiting method.");
                return;
            }

            var collection = Context.ApiHelper.PlatformGraphQlClient.GetItem(Constants.SXAHeadlessTenantPath);

            if (collection != null)
            {
                Logger.Information($"Remove empty {siteName} collection.");
                Context.ApiHelper.PlatformGraphQlClient.DeleteItem(collection.itemId);
            }

            Logger.Information($"Site {siteName} does not exist. Proceeding to create the site.");

            var createSiteResponse = Context.ApiHelper.PlatformGraphQlClient.CreateSite(siteName);
            var jobName = createSiteResponse.scaffoldSolution.job.name;

            Logger.Information($"Site creation initiated. Job name: {jobName}");

            Logger.Information("Waiting for the site creation job to complete...");
            Extensions.WaitForCondition(Context.ApiHelper.PlatformGraphQlClient,
                o => o.GetSitesAndJobsList(jobName)?.jobs?.nodes[0]?.done == true,
                TimeSpan.FromMinutes(5), 500);

            Logger.Information($"Site {siteName} was created successfully.");
        }
        catch (Exception ex)
        {
            Logger.Error(ex, $"An error occurred while creating site {siteName}");
        }

        Console.WriteLine($"Site {siteName} was created");
    }
}
