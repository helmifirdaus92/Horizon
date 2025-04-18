// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.SxaRestClient.Responses;

public class InsertRenderingResponse
{
    public DataSourceBehaviour dataSourceBehaviour { get; set; }
    public RenderingParameters renderingParameters { get; set; }
    public bool ok { get; set; }
}

public class DataSourceBehaviour
{
    public bool isAutoDataSource { get; set; }
    public string behaviour { get; set; }
    public string dataSourceTemplate { get; set; }
}

public class RenderingParameters
{
    public string GridParameters { get; set; }
    public string FieldNames { get; set; }
    public string Styles { get; set; }
    public string RenderingIdentifier { get; set; }
    public string CSSStyles { get; set; }
    public string DynamicPlaceholderId { get; set; }
}
