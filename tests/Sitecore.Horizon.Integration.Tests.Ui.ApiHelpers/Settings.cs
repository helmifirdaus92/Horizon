// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace Sitecore.Horizon.Integration.Tests.Ui.ApiHelpers
{
    public static class Settings
    {
        public const string DefaultDevice = "{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}";
        public static readonly string AdminUser = ConfigurationManager.AppSettings["AdminUser"];
        public static readonly string AdminPassword = ConfigurationManager.AppSettings["AdminPassword"];
        public static readonly string AuthClientId = ConfigurationManager.AppSettings["AuthClientId"];
        public static readonly string AuthAudience = ConfigurationManager.AppSettings["AuthAudience"];
        public static readonly string OrganizationId = ConfigurationManager.AppSettings["OrganizationId"];
        private static JwtSecurityToken accessToken;

        public static string AccessToken
        {
            get
            {
                if (accessToken.ValidTo - DateTime.Now.ToUniversalTime() < TimeSpan.FromSeconds(15))
                {
                    FetchToken();
                }

                return accessToken.RawData;
            }
        }

        public static void FetchToken(string organizationId = null, string tenantId = null)
        {
            var client = new RestClient("https://auth-staging-1.sitecore-staging.cloud");
            var request = new RestRequest("/oauth/token", Method.Post);
            request.AddJsonBody(new
            {
                client_id = AuthClientId,
                audience = AuthAudience,
                grant_type = "password",
                username = AdminUser,
                password = AdminPassword,
                scope = "openid email profile offline_access",
                organization = OrganizationId ?? "org_FzUOtp4HjfZYw1Hv",
                tenant_id = tenantId ?? null
            });
            var response = client.Execute(request);
            response.ThrowIfError();

            var responseContent = JsonConvert.DeserializeObject<JToken>(response.Content);
            var token = responseContent["access_token"].ToString();
            accessToken = new JwtSecurityToken(token);
        }
    }
}
