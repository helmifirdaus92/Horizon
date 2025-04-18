// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Identity;

public class IdentityApi
{
    private readonly HttpClient _client;

    public IdentityApi(string baseUrl)
    {
        _client = new HttpClient();
        _client.BaseAddress = new Uri(baseUrl);
    }

    public GetMembersResponse GetMembers()
    {
        var queries = new Dictionary<string, string>
        {
            ["pagenumber"] = "1",
            ["pagesize"] = "100",
        };
        var requestUri = QueryHelpers.AddQueryString("api/identity/v1/organization/members", queries);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        var resultString = _client.GetAsync(requestUri).ConfigureAwait(false).GetAwaiter().GetResult().Content
            .ReadAsStringAsync().Result;
        GetMembersResponse result = JsonConvert.DeserializeObject<GetMembersResponse>(resultString);
        return result;
    }

    public HttpStatusCode AddMemberRole(string memberId, Role role)
    {
        var requestUri = $"/api/identity/v1/organization/members/{memberId}/roles";
        var request = JsonConvert.SerializeObject(new MemberRolesRequest(role));
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        HttpResponseMessage result = _client.PostAsync(requestUri, new StringContent(request, Encoding.UTF8, "application/json")).ConfigureAwait(false).GetAwaiter().GetResult();
        return result.StatusCode;
    }

    public HttpStatusCode DeleteMemberRole(string memberId, Role role)
    {
        var requestUri = $"/api/identity/v1/organization/members/{memberId}/roles";
        HttpRequestMessage request = new()
        {
            Content = JsonContent.Create(new MemberRolesRequest(role)),
            Method = HttpMethod.Delete,
            RequestUri = new Uri(requestUri, UriKind.Relative)
        };
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        HttpResponseMessage result = _client.SendAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return result.StatusCode;
    }

    public HttpStatusCode DeleteMemberRoles(string memberId, List<Role> roles)
    {
        var requestUri = $"/api/identity/v1/organization/members/{memberId}/roles";
        HttpRequestMessage request = new()
        {
            Content = JsonContent.Create(new MemberRolesRequest(roles)),
            Method = HttpMethod.Delete,
            RequestUri = new Uri(requestUri, UriKind.Relative)
        };
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        HttpResponseMessage result = _client.SendAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return result.StatusCode;
    }

    public HttpStatusCode AddTenantAccessForMember(string memberId, List<Role> roles)
    {
        var requestUri = $"/api/identity/v1/organization/members/{memberId}/roles";
        HttpRequestMessage request = new()
        {
            Content = JsonContent.Create(new MemberRolesRequest(roles)),
            Method = HttpMethod.Post,
            RequestUri = new Uri(requestUri, UriKind.Relative)
        };

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        HttpResponseMessage result = _client.SendAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return result.StatusCode;
    }

    public HttpStatusCode AddMemberToOrg(string memberId, string organizationId)
    {
        var requestUri = $"/api/v2/organizations/{organizationId}/members";

        var requestBody = new
        {
            members = new[]
            {
                memberId
            }
        };

        HttpRequestMessage request = new()
        {
            Content = JsonContent.Create(requestBody),
            Method = HttpMethod.Post,
            RequestUri = new Uri(requestUri, UriKind.Relative)
        };

        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.IdentityManagementAccessToken);
        HttpResponseMessage result = _client.SendAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return result.StatusCode;
    }

    public void SetUserRoleForTenantId(Member memberDetails, string tenantId, string organizationId)
    {

        Role currentRole = memberDetails.roles.Find(r => r.tenantId != null && r.tenantId.Equals(tenantId));
        if (currentRole is { role: "User" })
        {
            Console.WriteLine($"User access already satisfied for {memberDetails.email}");
            return;
        }

        Role userRole = new()
        {
            organizationId = organizationId,
            tenantId = tenantId
        };
        Console.WriteLine(AddMemberRole(memberDetails.id, userRole).Equals(HttpStatusCode.NoContent) ? $"User access updated successfully for {memberDetails.email}" : "User access update failed");

        if (currentRole is not { role: "Admin" })
        {
            return;
        }

        userRole.role = "Admin";
        Console.WriteLine(DeleteMemberRole(memberDetails.id, userRole).Equals(HttpStatusCode.NoContent) ? $"Admin role record deleted for {memberDetails.email}" : "Admin role record deletion failed");
    }
}
