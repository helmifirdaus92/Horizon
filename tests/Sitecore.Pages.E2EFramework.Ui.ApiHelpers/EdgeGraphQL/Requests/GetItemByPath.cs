// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Requests;

public class GetItemByPath : GraphQLRequest
{
    public GetItemByPath(string path, string lang = "en")
    {
        Query = @"
                query Item ($language: String!, $itemPath: String!) {
                    item(language: $language, path: $itemPath) {
                            id
                            name
                            displayName
                            fields {
                              __typename
                              id
                              value
                              name
                            }
                            personalization{variantIds}
                          }
                        }";
        Variables = new
        {
            itemPath = path,
            language = lang
        };
    }
}
