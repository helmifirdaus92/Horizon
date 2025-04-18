// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity
{
    public class IdentityAdminApi
    {
        private readonly HttpClient _client;

        public IdentityAdminApi(string baseUrl)
        {
            _client = new HttpClient();
            _client.BaseAddress = new Uri(baseUrl);
        }

        public Member AddMember(Member member)
        {
            var requestUri = "admin/v1/users";
            var request = JsonConvert.SerializeObject(member);
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.IdentityAdminAccessToken);
            HttpResponseMessage result = _client.PostAsync(requestUri, new StringContent(request, Encoding.UTF8, "application/json")).ConfigureAwait(false).GetAwaiter().GetResult();
            var responseContent = result.Content.ReadAsStringAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            return JsonConvert.DeserializeObject<Member>(responseContent);
        }

        public HttpStatusCode DeleteMember(string userId)
        {
            var requestUri = $"admin/v1/users/{userId}";
            _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.IdentityAdminAccessToken);
            HttpResponseMessage result = _client.DeleteAsync(requestUri).ConfigureAwait(false).GetAwaiter().GetResult();
            return result.StatusCode;
        }
    }
}
