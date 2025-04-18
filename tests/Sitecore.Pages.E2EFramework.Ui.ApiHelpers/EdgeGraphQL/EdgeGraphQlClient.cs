// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Client;
using GraphQL.Common.Request;
using Newtonsoft.Json;
using RestSharp;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Modals;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Requests;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Responses;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL;

public class EdgeGraphQlClient
{
    private readonly GraphQLClient _client;

    public EdgeGraphQlClient(string baseUrl, string token)
    {
        _client = new GraphQLClient(baseUrl);
        _client.DefaultRequestHeaders.Add("X-GQL-Token", token);
    }

    public EdgeGraphQlClient(string baseUrl, string edgeUrl, string edgeClientId, string edgeClientSecret)
    {
        // get token
        RestClient edgeClient = new(edgeUrl);
        edgeClient.AddDefaultHeader("Authorization", "Bearer " + Settings.BearerToken(edgeClientId, edgeClientSecret, true));
        string body = "{" +
            "\"CreatedBy\": \"Pages Tests\"," +
            "\"Label\": \"Pages CI\"," +
            "\"Scopes\":[" +
                "\"content-#everything#\"," +
                "\"audience-preview\"," +
                "\"audience-delivery\"" +
            "]}";
        RestRequest request = new RestRequest(edgeUrl, Method.Post).AddStringBody(body, DataFormat.Json);
        RestResponse response = edgeClient.Execute(request);
        var token = response.Content.Replace("\"", "");

        _client = new GraphQLClient(baseUrl);
        _client.DefaultRequestHeaders.Add("X-GQL-Token", token);
    }

    public Item GetItemByPathAsync(string path)
    {
        GraphQLRequest request = new GetItemByPath(path);
        var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return JsonConvert.DeserializeObject<Item>(response.Data.item.ToString());
    }

    public List<string> GetVariants(string path, string language = "en")
    {
        var request = new GetVariantsRequest(path, language);
        var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return JsonConvert.DeserializeObject<GetVariantsResponse>(response.Data.item.ToString());
    }
}
