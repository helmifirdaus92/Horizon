// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Microsoft.Extensions.Configuration;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers;

namespace Sitecore.Horizon.Integration.GraphQL.Tests;

public static class TestSettings
{
    /**
     * This variable used for definition of env tests run against
     * TRUE - whe tests are run against local env and there is no need additional site creation
     * FALSE - causes new site creation and after test execution site will be deleted
     * By default it is false. Change this value in the config.json.
     */
    public static bool RunLocal;

    static TestSettings()
    {
        Config = new ConfigurationBuilder()
            .AddJsonFile("config.json")
            .AddEnvironmentVariables()
            .Build();

        CmUrl = Environment.GetEnvironmentVariable("CMUrl") ?? Config.GetSection("CMUrl").Get<string>();
        Client_id = Environment.GetEnvironmentVariable("xmCloudClientId") ?? Config.GetSection("xmCloudClientId").Get<string>();
        Console.WriteLine("xmCloudClientId " + Client_id);
        Client_Secret = Environment.GetEnvironmentVariable("xmCloudClientSecret") ?? Config.GetSection("xmCloudClientSecret").Get<string>();
        Console.WriteLine("xmCloudClientSecret " + Client_Secret);
        Authority = Environment.GetEnvironmentVariable("xmCloudAuthAuthority") ?? Config.GetSection("xmCloudAuthAuthority").Get<string>();
        Console.WriteLine("xmCloudAuthAuthority " + Authority);
        Audience = Environment.GetEnvironmentVariable("xmCloudAPIAudience") ?? Config.GetSection("xmCloudAPIAudience").Get<string>();
        Console.WriteLine("xmCloudAPIAudience " + Audience);
        AuthClientId = Environment.GetEnvironmentVariable("AuthClientId") ?? Config.GetSection("AuthClientId").Get<string>();
        OrganizationId = Environment.GetEnvironmentVariable("OrganizationId") ?? Config.GetSection("OrganizationId").Get<string>();
        AdminUser = Environment.GetEnvironmentVariable("AdminUser") ?? Config.GetSection("AdminUser").Get<string>();
        AdminPassword = Environment.GetEnvironmentVariable("AdminPassword") ?? Config.GetSection("AdminPassword").Get<string>();
        UserEmail = Environment.GetEnvironmentVariable("UserEmail") ?? Config.GetSection("UserEmail").Get<string>();
        UserPassword = Environment.GetEnvironmentVariable("UserPassword") ?? Config.GetSection("UserPassword").Get<string>();
        InventoryApi = Environment.GetEnvironmentVariable("InventoryApi") ?? Config.GetSection("InventoryApi").Get<string>();
        IdentityApi = Environment.GetEnvironmentVariable("IdentityApi") ?? Config.GetSection("IdentityApi").Get<string>();

        Settings.AdminUser = AdminUser;
        Settings.AdminPassword = AdminPassword;
        Settings.UserEmail = UserEmail;
        Settings.UserPassword = UserPassword;
        Settings.AuthAudience = Audience;
        Settings.AuthClientId = AuthClientId;
        Settings.OrganizationId = OrganizationId;
        Settings.GetBearerToken(Client_id, Client_Secret, Authority, Audience);

        RunLocal = Convert.ToBoolean(Environment.GetEnvironmentVariable("RunLocal") ?? Config.GetSection("RunLocal").Get<string>());
    }

    public static IConfigurationRoot Config { get; }

    public static string CmUrl { get; }
    public static string Client_id { get; }
    public static string Client_Secret { get; }
    public static string Authority { get; }

    public static string AuthClientId { get; }
    public static string Audience { get; }

    public static string OrganizationId { get; }

    public static string AdminUser { get; }

    public static string AdminPassword { get; }
    public static string UserEmail { get; }

    public static string UserPassword { get; }

    public static string InventoryApi { get; }
    public static string IdentityApi { get; }
}
