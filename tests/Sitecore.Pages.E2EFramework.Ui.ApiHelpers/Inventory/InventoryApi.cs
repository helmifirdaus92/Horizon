// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.WebUtilities;
using Newtonsoft.Json;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Inventory;

public class InventoryApi
{
    private readonly HttpClient _client;

    public InventoryApi(string baseUrl)
    {
        _client = new HttpClient();
        _client.BaseAddress = new Uri(baseUrl);
    }

    public GetTenantsResponse GetTenants()
    {
        var queries = new Dictionary<string, string>
        {
            ["pagenumber"] = "1",
            ["pagesize"] = "100",
            ["state"] = "Active",
            ["labels"] = "Environment=staging,ProductCode=XMCloud"
        };
        var requestUri = QueryHelpers.AddQueryString("tenants", queries);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        var response = _client.GetAsync(requestUri).ConfigureAwait(false).GetAwaiter().GetResult();
        var resultString = response.Content
            .ReadAsStringAsync().Result;
        var result = JsonConvert.DeserializeObject<GetTenantsResponse>(resultString);
        return result;
    }
}
