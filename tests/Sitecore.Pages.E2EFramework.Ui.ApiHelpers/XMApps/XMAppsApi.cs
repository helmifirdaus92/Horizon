// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Text.Json;
using RestSharp;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Requests;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps.Types;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.XMApps;

public class XMAppsApi
{
    public readonly RestClient _client;


    public XMAppsApi(string baseUrl)
    {
        _client = new RestClient(baseUrl);
    }

    public ResponseStatus CreateCollection(string name, string displayName = null)
    {
        var request = new RestRequest("collections");
        displayName = displayName ?? name;
        request.AddBody(new CreateCollection()
        {
            name = name,
            displayName = displayName,
            description = "Collection for " + displayName
        });
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        return _client.ExecutePost(request).ResponseStatus;
    }

    public ResponseStatus DeleteCollection(string collectionId)
    {
        var request = new RestRequest($"collections/{collectionId}");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        return _client.Delete(request).ResponseStatus;
    }

    public List<Collection> GetCollections()
    {
        var request = new RestRequest("collections");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        var response = _client.ExecuteGet(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var collections = JsonSerializer.Deserialize<List<Collection>>(response.Content!, options)!;
        return collections;
    }

    public void CreateSiteInCollection(string name,
        string displayName = null,
        string templateId = "{5AAE1EEA-EA24-40BF-96F1-1F43DA82C77B}",
        string collectionId = null,
        string language = "en",
        List<string> languages = null,
        List<CreateSite.PosMapping> postMapping = null
    )
    {
        var request = new RestRequest("sites");
        displayName = displayName ?? name;
        request.AddBody(new CreateSite()
        {
            siteName = name,
            displayName = displayName,
            templateId = templateId,
            language = language,
            hostName = "*",
            languages = languages ?? new List<string>
            {
                language,
                "da"
            },
            collectionId = collectionId,
            posMappings = postMapping ?? new List<CreateSite.PosMapping>()
        });
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        var response = _client.ExecutePost(request);
    }

    public Site UpdateSiteLanguages(string siteId, List<string> supportedLanguages)
    {
        var request = new RestRequest($"sites/{siteId}");
        request.AddBody(new UpdateSite()
        {
            supportedLanguages = supportedLanguages
        });
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");

        var response = _client.Patch(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var site = JsonSerializer.Deserialize<Site>(response.Content!, options)!;
        return site;
    }

    public Site SetSiteAsShared(string siteId)
    {
        var request = new RestRequest($"sites/{siteId}");
        request.AddBody(new UpdateSite()
        {
            shared = true
        });
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");

        var response = _client.Patch(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var site = JsonSerializer.Deserialize<Site>(response.Content!, options)!;
        return site;
    }

    public List<Site> GetSitesInCollection(string collectionId)
    {
        var request = new RestRequest($"collections/{collectionId}/sites");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        var response = _client.ExecuteGet(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var sites = JsonSerializer.Deserialize<List<Site>>(response.Content!, options)!;
        return sites;
    }

    public List<Site> GetSites()
    {
        var request = new RestRequest("sites");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        var response = _client.ExecuteGet(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var sites = JsonSerializer.Deserialize<List<Site>>(response.Content!, options)!;
        return sites;
    }

    public List<Job> GetJobs()
    {
        var request = new RestRequest("jobs");
        request.AddHeader("Content-Type", "application/json");
        request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
        var response = _client.ExecuteGet(request);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var jobs = JsonSerializer.Deserialize<List<Job>>(response.Content!, options)!;
        return jobs;
    }
}
