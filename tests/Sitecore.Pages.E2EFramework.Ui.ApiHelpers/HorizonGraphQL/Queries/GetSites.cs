// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetSites : GraphQLRequest
{
    public GetSites()
    {
        Query = @"query {
                          sites {
                            appName
                            language
                            layoutServiceConfig
                            name
                            pointOfSale
                            renderingEngineApplicationUrl
                            renderingEngineEndpointUrl
                            rootPath
                            startPath
                          }
                        }
                        ";
    }
}
