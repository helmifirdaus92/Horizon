// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Deploy;

public class DeployApi
{
    public readonly HttpClient _client;

    public DeployApi(string baseUrl)
    {
        _client = new HttpClient();
        _client.BaseAddress = new Uri(baseUrl);
    }

    public string GetEdgeAccessToken(string xmcEnvironmentId, string xmcProjectId)
    {
        var requestUrl = $@"/api/environments/v1/{xmcEnvironmentId}/obtain-edge-token?project_id={xmcProjectId}";
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        var resultString = _client.GetAsync(requestUrl).ConfigureAwait(false).GetAwaiter().GetResult().Content.ReadAsStringAsync().Result;
        var result = JsonConvert.DeserializeObject<GetEdgeTokenResponse>(resultString);
        return result.apiKey;
    }

    public GenerateEdgeClientResponse GenerateEdgeClient(string xmcEnvironmentId, string xmcProjectId)
    {
        CreateEdgeClientRequest createEdgeClientRequest = new CreateEdgeClientRequest
        {
            projectId = xmcProjectId,
            environmentId = xmcEnvironmentId,
            name = "Pages Automation Edge Client",
            description = "Pages Automation Edge Client"
        };

        var request = JsonConvert.SerializeObject(createEdgeClientRequest);
        var requestUrl = $@"/api/clients/v1/edge";
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);

        var result = _client.PostAsync(requestUrl, new StringContent(request, Encoding.UTF8, "application/json")).ConfigureAwait(false).GetAwaiter().GetResult().Content.ReadAsStringAsync().Result;
        
        return JsonConvert.DeserializeObject<GenerateEdgeClientResponse>(result);
    }

    public List<EnvironmentClient> GetEnvironmentClients(string xmcEnvironmentId)
    {
        var requestUrl = "/api/clients/v1/environment";
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);

        var response = _client.GetAsync(requestUrl).ConfigureAwait(false).GetAwaiter().GetResult();
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException($"Failed to get environment clients. Status code: {response.StatusCode}");
        }

        var resultString = response.Content.ReadAsStringAsync().Result;
        var result = JsonConvert.DeserializeObject<GetEnvironmentClientsResponse>(resultString);
        return result.items;
    }

    public HttpStatusCode DeleteEdgeClient(string xmcEnvironmentId,string clientId)
    {
        var environmentClients = GetEnvironmentClients(xmcEnvironmentId);
        var client = environmentClients.Find(c => c.clientId == clientId);
        var requestUrl = $@"/api/clients/v1/{client?.id}";
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        var response = _client.DeleteAsync(requestUrl).Result;
        return response.StatusCode;
    }

    public class CreateEdgeClientRequest
    {
        public string projectId { get; set; }
        public string environmentId { get; set; }
        public string name { get; set; }
        public string description { get; set; }
    }

    public class GetEdgeTokenResponse
    {
        public string apiKey { get; set; }
        public string edgeUrl { get; set; }
    }

    public class GenerateEdgeClientResponse
    {
        public string name { get; set; }
        public string description { get; set; }
        public string clientId { get; set; }
        public string clientSecret { get; set; }
    }

    public class EnvironmentClient
    {
        public string id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public string clientId { get; set; }
        public DateTime createdAt { get; set; }
        public int clientType { get; set; }
        public string projectName { get; set; }
        public string environmentName { get; set; }
    }

    public class GetEnvironmentClientsResponse
    {
        public List<EnvironmentClient> items { get; set; }
    }
}
