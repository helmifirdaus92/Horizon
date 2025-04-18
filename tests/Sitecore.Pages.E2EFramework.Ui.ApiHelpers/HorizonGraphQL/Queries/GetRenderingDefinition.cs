// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetRenderingDefinition : GraphQLRequest
{
    public GetRenderingDefinition(string pathOrId, string contextItemId, string language, string site)
    {
        Query = @"
                query GetRenderingDefinition($path: String!, $contextItemId: String!, $language: String!, $site: String!) {
                    renderingDefinition(path:$path, contextItemId:$contextItemId, language:$language, site:$site) {
                    datasourceRootItems {
                      name,
                      path,
                      id,
                      children {
                        id,
                        name
                      }
                      ancestors {
                        id,
                        name
                      }
                    }
                    templates {
                      id,
                      name,
                      path
                    }
                }
            }";

        Variables = new
        {
            path = pathOrId,
            contextItemId = contextItemId,
            language = language,
            site = site
        };
    }
}
