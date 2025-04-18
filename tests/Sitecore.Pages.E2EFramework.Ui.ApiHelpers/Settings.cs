// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestSharp;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers
{
    public static class Settings
    {
        public static string AdminUser = ConfigurationManager.AppSettings["AdminUser"];
        public static string AdminPassword = ConfigurationManager.AppSettings["AdminPassword"];
        public static string UserEmail = ConfigurationManager.AppSettings["UserEmail"];
        public static string UserPassword = ConfigurationManager.AppSettings["UserPassword"];
        public static string AuthClientId = ConfigurationManager.AppSettings["AuthClientId"];
        public static string AuthAudience = ConfigurationManager.AppSettings["AuthAudience"];
        public static string OrganizationId = ConfigurationManager.AppSettings["OrganizationId"];
        public static string TenantId = string.Empty;
        public static string OneScAuth0Api = ConfigurationManager.AppSettings["OneScAuth0Api"];

        public static string IdentityAppClientId = ConfigurationManager.AppSettings["IdentityAppClientId"];
        public static string IdentityAppClientSecret = ConfigurationManager.AppSettings["IdentityAppClientSecret"];


        private static JwtSecurityToken accessToken;
        private static JwtSecurityToken userAccessToken;
        private static JwtSecurityToken tenantAccessToken;
        private static JwtSecurityToken bearerToken;

        private static JwtSecurityToken identityAdminAccessToken;
        private static JwtSecurityToken identityManagementAccessToken;

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

        public static string TenantAccessToken
        {
            get
            {
                if (tenantAccessToken.ValidTo - DateTime.Now.ToUniversalTime() < TimeSpan.FromSeconds(15))
                {
                    FetchTenantToken(tenantId: TenantId);
                }

                return tenantAccessToken.RawData;
            }
        }

        public static string UserAccessToken
        {
            get
            {
                if (userAccessToken.ValidTo - DateTime.Now.ToUniversalTime() < TimeSpan.FromSeconds(15))
                {
                    FetchUserToken();
                }

                return userAccessToken.RawData;
            }
            set
            {
                userAccessToken = new JwtSecurityToken(value);
            }
        }

        public static string IdentityAdminAccessToken
        {
            get
            {
                if (identityAdminAccessToken == null || identityAdminAccessToken.ValidTo - DateTime.Now.ToUniversalTime() < TimeSpan.FromSeconds(15))
                {
                    SetIdentityToken();
                }

                return identityAdminAccessToken.RawData;
            }
        }

        public static string IdentityManagementAccessToken
        {
            get
            {
                if (identityManagementAccessToken == null || identityAdminAccessToken.ValidTo - DateTime.Now.ToUniversalTime() < TimeSpan.FromSeconds(15))
                {
                    SetIdentityToken($"{OneScAuth0Api}/api/v2/");
                }

                return identityManagementAccessToken.RawData;
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

        public static void FetchUserToken(string organizationId = null)
        {
            var client = new RestClient("https://auth-staging-1.sitecore-staging.cloud");
            var request = new RestRequest("/oauth/token", Method.Post);
            request.AddJsonBody(new
            {
                client_id = AuthClientId,
                audience = AuthAudience,
                grant_type = "password",
                username = UserEmail,
                password = UserPassword,
                organization = OrganizationId ?? "org_FzUOtp4HjfZYw1Hv"
            });
            var response = client.Execute(request);
            response.ThrowIfError();

            var responseContent = JsonConvert.DeserializeObject<JToken>(response.Content);
            var token = responseContent["access_token"].ToString();

            userAccessToken = new JwtSecurityToken(token);
        }

        public static void FetchTenantToken(string organizationId = null, string tenantId = null)
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
                scope = "openid email profile offline_access xmcloud.sites:admin",
                organization = organizationId ?? OrganizationId,
                tenant_id = tenantId ?? TenantId
            });
            var response = client.Execute(request);
            response.ThrowIfError();

            var responseContent = JsonConvert.DeserializeObject<JToken>(response.Content);
            var token = responseContent["access_token"].ToString();

            tenantAccessToken = new JwtSecurityToken(token);
        }

        public static void GetBearerToken(string _clientId, string _clientSecret, bool isEdgeClient = false)
        {
            var audience = "https://api-staging.sitecore-staging.cloud";
            var authority = "https://auth-staging-1.sitecore-staging.cloud";
            GetBearerToken(_clientId, _clientSecret, authority, audience, isEdgeClient);
        }

        public static void GetBearerToken(string _clientId, string _clientSecret, string authority, string audience, bool isEdgeClient = false)
        {
            Console.WriteLine("Get bearer token");
            var client = new RestClient(authority);
            var request = new RestRequest("/oauth/token", Method.Post);
            request.AddJsonBody(new
            {
                client_id = _clientId,
                audience = audience,
                grant_type = "client_credentials",
                client_secret = _clientSecret
            });
            var response = client.Execute(request);
            if (response.ErrorException != null)
            {
                Console.WriteLine("GetBearerToken error - " + response.ErrorException.Message);
            }

            response.ThrowIfError();

            var responseContent = JsonConvert.DeserializeObject<JToken>(response.Content);
            var token = responseContent["access_token"].ToString();

            if (isEdgeClient == false)
            {
                accessToken = new JwtSecurityToken(token);
            }
            else
            {
                bearerToken = new JwtSecurityToken(token);
            }
        }


        public static void SetIdentityToken(string audience = "https://identity.sitecore-staging.cloud")
        {
            Console.WriteLine("Get bearer token");
            var client = new RestClient(OneScAuth0Api);
            var request = new RestRequest("/oauth/token", Method.Post);
            request.AddJsonBody(new
            {
                client_id = IdentityAppClientId,
                client_secret = IdentityAppClientSecret,
                audience,
                grant_type = "client_credentials",
            });

            var response = client.Execute(request);
            if (response.ErrorException != null)
            {
                Console.WriteLine("GetBearerToken error - " + response.ErrorException.Message);
            }

            response.ThrowIfError();

            var responseContent = JsonConvert.DeserializeObject<JToken>(response.Content);
            var token = responseContent["access_token"].ToString();

            if (audience == "https://identity.sitecore-staging.cloud")
            {
                identityAdminAccessToken = new JwtSecurityToken(token);
            }
            else
            {
                identityManagementAccessToken = new JwtSecurityToken(token);
            }
        }

        public static string BearerToken(string clientId, string clientSecret, bool isEdgeClient = false)
        {
            GetBearerToken(clientId, clientSecret, isEdgeClient);
            return bearerToken.RawData;
        }
    }
}
