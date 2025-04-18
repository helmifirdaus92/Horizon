// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using RestSharp;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.SxaRestClient.Responses;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.SxaRestClient;

public class SxaRestClient
{
    private readonly RestClient _sxaclient;
    private readonly string _baseUrl;

    public SxaRestClient(string baseUrl)
    {
        _baseUrl = baseUrl;
        _sxaclient = new RestClient(_baseUrl);
        _sxaclient.AddDefaultHeader("Authorization", $"Bearer {Settings.AccessToken}");
    }

    public InsertRenderingResponse InsertRendering(string pageId, string renderingId, string language = "en")
    {
        RestRequest insertRenderingRequest = new($"{_baseUrl}/sxa/horizon/metadata/insertrendering", Method.Post);
        insertRenderingRequest.AddParameter("language", language);
        insertRenderingRequest.AddParameter("pageID", pageId);
        insertRenderingRequest.AddParameter("renderingID", renderingId);
        RestResponse<InsertRenderingResponse> insertRenderingResponse = _sxaclient.Execute<InsertRenderingResponse>(insertRenderingRequest);

        return insertRenderingResponse.Data;
    }

    public CreateDatasourceResponse CreateDatasource(string pageId, string renderingId, string language = "en", string datasourceName = "")
    {
        RestRequest createRenderingRequest = new($"{_baseUrl}/sxa/horizon/datasource/create", Method.Post);
        createRenderingRequest.AddParameter("language", language);
        createRenderingRequest.AddParameter("pageID", pageId);
        createRenderingRequest.AddParameter("renderingID", renderingId);
        createRenderingRequest.AddParameter("datasourceName", datasourceName);
        RestResponse<CreateDatasourceResponse> createRenderingResponse = _sxaclient.Execute<CreateDatasourceResponse>(createRenderingRequest);

        return createRenderingResponse.Data;
    }

    public PopulatePageDataResponse PopulatePageData(string pageId, string renderingId, string language = "en")
    {
        RestRequest populatePageDataRequest = new($"{_baseUrl}/sxa/horizon/datasource/populatepagedata", Method.Post);
        populatePageDataRequest.AddParameter("language", language);
        populatePageDataRequest.AddParameter("pageID", pageId);
        populatePageDataRequest.AddParameter("renderingID", renderingId);
        RestResponse<PopulatePageDataResponse> populatePageDataResponse = _sxaclient.Execute<PopulatePageDataResponse>(populatePageDataRequest);

        return populatePageDataResponse.Data;
    }

    public MakeLocalPathResponse MakeLocalPath(string pageId, string datasourceId)
    {
        RestRequest makeLocalPathRequest = new($"{_baseUrl}/sxa/horizon/datasource/makelocalpath", Method.Post);
        makeLocalPathRequest.AddParameter("pageID", pageId);
        makeLocalPathRequest.AddParameter("datasourceId", datasourceId);
        RestResponse<MakeLocalPathResponse> makeLocalPathResponse = _sxaclient.Execute<MakeLocalPathResponse>(makeLocalPathRequest);

        return makeLocalPathResponse.Data;
    }
}
