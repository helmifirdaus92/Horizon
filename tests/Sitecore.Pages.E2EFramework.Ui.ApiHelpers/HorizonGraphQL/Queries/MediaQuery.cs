// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class MediaQuery : GraphQLRequest
{
    public MediaQuery(string root, List<string> sources, string query = "", string language = "en", string site = "SXAHeadlessSite", List<string> baseTemplateIds = null)
    {
        Query = @"query MediaQuery($root: String!,$sources: [String!]!,$query: String!,$language: String!,$site: String!,$baseTemplateIds: [String!]){
                      mediaQuery(
                            query: $query,
                            root: $root,
                            sources: $sources,
                            language: $language,
                            site: $site,
                            baseTemplateIds: $baseTemplateIds
                        ){
                        hasMoreItems
                        items{
                            alt,
                            dimensions,
                            displayName,
                            extension,
                            hasMediaStream,
                            height,
                            id,
                            mimeType,
                            parentId,
                            path,
                            size,
                            url,
                            width,
                          __typename
                        }
                        __typename
                       }
                    }";
        Variables = new
        {
            root,
            sources,
            query,
            language,
            site,
            baseTemplateIds
        };
    }
}
