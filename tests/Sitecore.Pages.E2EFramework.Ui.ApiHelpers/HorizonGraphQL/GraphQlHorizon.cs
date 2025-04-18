// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using GraphQL.Client;
using GraphQL.Common.Request;
using GraphQL.Common.Response;
using Newtonsoft.Json;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Items;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Responses;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL;

public class GraphQlHorizon
{
    private const string HorizonApiUrl = "/api/ssc/horizon/query/?sc_horizon=api&sc_headless_mode=api";
    private readonly GraphQLClient _client;
    private readonly string _baseUrl;

    public GraphQlHorizon(string baseUrl)
    {
        _baseUrl = baseUrl;
        _client = new GraphQLClient(_baseUrl + HorizonApiUrl);
    }

    public void Dispose()
    {
        _client.Dispose();
    }

    public GraphQLResponse UploadMedia(string filename, string extension, string blob,
        string destinationFolderId, string site = "SXAHeadlessSite", string language = "en")
    {
        GraphQLRequest request = new UploadMedia(filename, extension, blob, destinationFolderId, site, language);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        //return JsonConvert.DeserializeObject<UploadMediaResponse>(response.Data.uploadMedia.ToString());
        return response;
    }

    public GraphQLResponse MediaQuery(string root, List<string> sources, string query = "", string language = "en", string site = "SXAHeadlessSite", List<string> baseTemplateIds = null)
    {
        GraphQLRequest request = new MediaQuery(root, sources, query, language, site, baseTemplateIds);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return response;
    }

    public List<Site> GetSites()
    {
        GraphQLRequest request = new GetSites();
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();
        return JsonConvert.DeserializeObject<List<Site>>(response.Data.sites.ToString());
    }

    public GraphQLResponse GetItem(string path, string language = "en", string site = "SXAHeadlessSite", int? version = null, bool enableItemFiltering = true)
    {
        GraphQLRequest request = new GetItem(path, language, site, version, enableItemFiltering);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public Page GetPagePresentationDetails(string path, string language = "en", string site = "SXAHeadlessSite", int? version = null, bool enableItemFiltering = true)
    {
        GraphQLRequest request = new GetPagePresentationDetails(path, language, site, version, enableItemFiltering);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        var response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return JsonConvert.DeserializeObject<GetPagePresentationDetailsResponse>(response.Data.ToString()).item;
    }

    public GraphQLResponse CreatePage(string pageName, string parentId, string templateId, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new CreatePage(language, site, parentId, pageName, templateId);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        return response;
        /*var responseContent = response.Data.ToString();
        CreateItemResponse createItemResponse = JsonConvert.DeserializeObject<CreateItemResponse>(responseContent);

        return createItemResponse.CreatePage;*/
    }

    public CreateItemPayload CreateFolder(string folderName, string parentId, string templateId, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new CreateFolder(parentId, folderName, templateId, language, site);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        var responseContent = response.Data.ToString();
        CreateItemResponse createFolderResponse = JsonConvert.DeserializeObject<CreateItemResponse>(responseContent);

        return createFolderResponse.createPage;
    }

    public CreateItemPayload AddItemVersion(string path, string versionName, int baseVersionNumber, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new AddItemVersion(path, versionName, baseVersionNumber, language, site);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        var responseContent = response.Data.ToString();
        CreateItemResponse addVersionResponse = JsonConvert.DeserializeObject<CreateItemResponse>(responseContent);

        return addVersionResponse.createPage;
    }

    public SaveItemPayload Save(
        string itemId,
        string layoutEditingKind,
        string presentationDetails,
        string originalPresentationDetails,
        int itemVersion = 1,
        string language = "en",
        string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new SaveItem(itemId, itemVersion, Guid.NewGuid().ToString(), layoutEditingKind, presentationDetails, originalPresentationDetails, language, site);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        var responseContent = response.Data.ToString();
        SaveItemResponse savePageResponse = JsonConvert.DeserializeObject<SaveItemResponse>(responseContent);

        return savePageResponse.saveItem;
    }

    public RawContentItem CreateRawItem(string parentId, string itemName, string templateId, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new CreateRawItem(parentId, itemName, templateId, language, site);
        _client.DefaultRequestHeaders
            .Authorization = new AuthenticationHeaderValue("Bearer", Settings.AccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        var responseContent = response.Data.ToString();
        CreateRawItemResponse createRawItemResponse = JsonConvert.DeserializeObject<CreateRawItemResponse>(responseContent);

        return createRawItemResponse.createRawItem.rawItem;
    }

    public GraphQLResponse DeleteItem(string path, string language = "en", string site = "SXAHeadlessSite", bool deletePermanently = true)
    {
        GraphQLRequest request = new DeleteItem(path, language, site, deletePermanently);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public MoveItemResponse MoveItem(string itemToMoveId, string targetId, string position, string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new MoveItem(itemToMoveId, targetId, position, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        MoveItemResponse data = JsonConvert.DeserializeObject<MoveItemResponse>(response.Data.ToString());

        return data;
    }

    public GraphQLResponse ExecuteWorkflowCommand(string itemId, string commandId, string comments, int itemVersion = 1, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new ExecuteWorkflowCommand(itemId, commandId, comments, itemVersion, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse GetRawItem(string path, string language = "en", string site = "SXAHeadlessSite", bool enableItemFiltering = true, string[] roots = null, string[] baseTemplateIds = null)
    {
        GraphQLRequest request = new GetRawItem(path, language, site, enableItemFiltering, roots, baseTemplateIds);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse GetRenderingDefinition(string renderingPathOrId, string contextItemId, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new GetRenderingDefinition(renderingPathOrId, contextItemId, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GetComponentsResponse GetComponents(string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new GetComponentsGroups(site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        if (response == null || response.Data == null)
        {
            return null;
        }

        GetComponentsResponse data = JsonConvert.DeserializeObject<GetComponentsResponse>(response.Data.ToString());

        return data;
    }

    public GraphQLResponse GetMediaFolderItem(string path, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new GetMediaFolderItem(path, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse GetMediaItem(string path, string[] sources = null, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new GetMediaItem(path, sources, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse GetMediaFolderAncestors(string path, List<string> sources = null, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new GetMediaFolderAncestors(path, sources, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse SetPublishingSettings(string path, int versionNumber = 1, string validFromDate = "", string validToDate = "", bool isAvailableToPublish = true, string language = "en", string site = "SXAHeadlessSite")
    {
        GraphQLRequest request = new SetPublishingSettings(path, versionNumber, validFromDate, validToDate, isAvailableToPublish, language, site);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }

    public GraphQLResponse GetItemState(string path, string language = "en", string site = "SXAHeadlessSite", int version = 1, bool withDisplayName = false, bool withWorkflow = false, bool withVersions = false, bool withPresentation = false, bool withLayoutEditingKind = false)
    {
        GraphQLRequest request = new GetItemState(path, language, site, version, withDisplayName, withWorkflow, withVersions, withPresentation, withLayoutEditingKind);
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", Settings.UserAccessToken);
        GraphQLResponse response = _client.PostAsync(request).ConfigureAwait(false).GetAwaiter().GetResult();

        return response;
    }
}
