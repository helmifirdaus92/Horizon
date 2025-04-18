// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;

namespace Sitecore.Pages.E2EFramework.UI.Tests;

public static class TestRunSettings
{
    static TestRunSettings()
    {
        Config = new ConfigurationBuilder()
            .AddJsonFile("config.json")
            .AddEnvironmentVariables()
            .Build();
        RunTestsEnv = Environment.GetEnvironmentVariable("RunTestsEnv") ?? "LocalCM";
        Console.WriteLine("Test Environment : " + RunTestsEnv);

        AuthProviderDomain = Environment.GetEnvironmentVariable("AuthProviderDomain") ?? Config.GetSection("AuthProviderDomain").Get<string>();
        AuthClientId = Environment.GetEnvironmentVariable("AuthClientId") ?? Config.GetSection("AuthClientId").Get<string>();
        AuthAudience = Environment.GetEnvironmentVariable("AuthAudience") ?? Config.GetSection("AuthAudience").Get<string>();
        AdminUser = Environment.GetEnvironmentVariable("AdminUser") ?? Config.GetSection("AdminUser").Get<string>();
        AdminPassword = Environment.GetEnvironmentVariable("AdminPassword") ?? Config.GetSection("AdminPassword").Get<string>();
        UserEmail = Environment.GetEnvironmentVariable("UserEmail") ?? Config.GetSection("UserEmail").Get<string>();
        UserPassword = Environment.GetEnvironmentVariable("UserPassword") ?? Config.GetSection("UserPassword").Get<string>();
        UserNoStartPageAccessEmail = Environment.GetEnvironmentVariable("UserNoStartPageAccessEmail") ?? Config.GetSection("UserNoStartPageAccessEmail").Get<string>();
        UserNoSiteAccessEmail = Environment.GetEnvironmentVariable("UserNoSiteAccessEmail") ?? Config.GetSection("UserNoSiteAccessEmail").Get<string>();
        UserNoLanguageAccessEmail = Environment.GetEnvironmentVariable("UserNoLanguageAccessEmail") ?? Config.GetSection("UserNoLanguageAccessEmail").Get<string>();
        UserNoLanguageWriteEmail = Environment.GetEnvironmentVariable("UserNoLanguageWriteEmail") ?? Config.GetSection("UserNoLanguageWriteEmail").Get<string>();
        UserWithLimitedAccessPassword = Environment.GetEnvironmentVariable("UserWithLimitedAccessPassword") ?? Config.GetSection("UserWithLimitedAccessPassword").Get<string>();
        OrganizationName = Environment.GetEnvironmentVariable("OrganizationName") ?? Config.GetSection("OrganizationName").Get<string>();
        OrganizationId = Environment.GetEnvironmentVariable("OrganizationId") ?? Config.GetSection("OrganizationId").Get<string>();
        ProjectName = Environment.GetEnvironmentVariable("ProjectName") ?? Config.GetSection("ProjectName").Get<string>();
        EnvironmentName = Environment.GetEnvironmentVariable("EnvironmentName") ?? Config.GetSection("EnvironmentName").Get<string>();
        RunTestsOnStaticSite = !Environment.GetEnvironmentVariable("RunTestsOnStaticSite").IsNullOrEmpty()
            ? bool.Parse(Environment.GetEnvironmentVariable("RunTestsOnStaticSite"))
            : Config.GetSection("RunTestsOnStaticSite").Get<bool>();
        StaticSiteForLocalRun = Environment.GetEnvironmentVariable("StaticSiteForLocalRun") ?? Config.GetSection("StaticSiteForLocalRun").Get<string>();
        EmailClientId = Environment.GetEnvironmentVariable("EmailClientId") ?? Config.GetSection("EmailClientId").Get<string>();
        EmailClientSecret = Environment.GetEnvironmentVariable("EmailClientSecret") ?? Config.GetSection("EmailClientSecret").Get<string>();
        EmailTenantId = Environment.GetEnvironmentVariable("EmailTenantId") ?? Config.GetSection("EmailTenantId").Get<string>();
        InventoryApi = Environment.GetEnvironmentVariable("InventoryApi") ?? Config.GetSection("InventoryApi").Get<string>();
        AuthoringApi = Environment.GetEnvironmentVariable("AuthoringApi") ?? Config.GetSection("AuthoringApi").Get<string>();
        EdgeDeliveryApi = Environment.GetEnvironmentVariable("EdgeDeliveryApi") ?? Config.GetSection("EdgeDeliveryApi").Get<string>();
        EdgeApi = Environment.GetEnvironmentVariable("EdgeApi") ?? Config.GetSection("EdgeApi").Get<string>();
        DeployApi = Environment.GetEnvironmentVariable("DeployApi") ?? Config.GetSection("DeployApi").Get<string>();
        IdentityApi = Environment.GetEnvironmentVariable("IdentityApi") ?? Config.GetSection("IdentityApi").Get<string>();
        XMAppsApi = Environment.GetEnvironmentVariable("XMAppsApi") ?? Config.GetSection("XMAppsApi").Get<string>();
        OneScAuth0Api = Environment.GetEnvironmentVariable("OneScAuth0Api") ?? Config.GetSection("OneScAuth0Api").Get<string>();
        CdpTenantUrl = Environment.GetEnvironmentVariable("CdpTenantUrl") ?? Config.GetSection("CdpTenantUrl").Get<string>();
        EdgeClientId = Config.GetSection("EdgeClientId").Get<string>();
        EdgeClientSecret = Config.GetSection("EdgeClientSecret").Get<string>();
        CmUrl = Config.GetSection("CMUrl").Get<string>();
        TenantName = Config.GetSection("TenantName").Get<string>();
        DesktopBrowser = Config.GetSection("DesktopBrowser").Get<bool>();

        // Local run
        StartUrl = Config.GetSection("StartUrl").Get<string>();
        if (RunTestsEnv != "LocalCM")
        {
            StartUrl = "https://pages-qa.sitecore-staging.cloud/";
        }

        Settings.AdminUser = AdminUser;
        Settings.AdminPassword = AdminPassword;
        Settings.AuthAudience = AuthAudience;
        Settings.AuthClientId = AuthClientId;
        Settings.OrganizationId = OrganizationId;
        Settings.OneScAuth0Api = OneScAuth0Api;
        Settings.IdentityAppClientId = Environment.GetEnvironmentVariable("IdentityAppClientId") ?? Config.GetSection("IdentityAppClientId").Get<string>();
        Settings.IdentityAppClientSecret = Environment.GetEnvironmentVariable("IdentityAppClientSecret") ?? Config.GetSection("IdentityAppClientSecret").Get<string>();
        Settings.FetchToken();
    }

    public static IConfigurationRoot Config { get; }
    public static string AuthProviderDomain { get; }
    public static string AuthClientId { get; }
    public static string AuthAudience { get; }
    public static string StartUrl { get; }
    public static string AdminUser { get; }
    public static string AdminPassword { get; }
    public static string UserEmail { get; }
    public static string UserPassword { get; }
    public static string UserNoStartPageAccessEmail { get; }
    public static string UserNoSiteAccessEmail { get; }
    public static string UserNoLanguageAccessEmail { get; }
    public static string UserNoLanguageWriteEmail { get; }
    public static string UserWithLimitedAccessPassword { get; }
    public static string OrganizationName { get; }
    public static string OrganizationId { get; }
    public static string ProjectName { get; }
    public static string EnvironmentName { get; }
    public static bool RunTestsOnStaticSite { get; }
    public static string StaticSiteForLocalRun { get; }
    public static string EmailClientId { get; }
    public static string EmailClientSecret { get; }
    public static string EmailTenantId { get; }
    public static string InventoryApi { get; }
    public static string AuthoringApi { get; }
    public static bool DesktopBrowser { get; }
    public static string EdgeDeliveryApi { get; }
    public static string EdgeApi { get; }
    public static string EdgeClientId { get; }
    public static string EdgeClientSecret { get; }
    public static string DeployApi { get; }
    public static string IdentityApi { get; }
    public static string OneScAuth0Api { get; set; }
    public static string XMAppsApi { get; }
    public static string ProjectId { get; }
    public static string EnvironmentId { get; }
    public static string CmUrl { get; }
    public static string TenantName { get; }
    public static string RunTestsEnv { get; }
    public static string CdpTenantUrl { get; }
}
