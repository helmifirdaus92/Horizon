// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.EdgeGraphQL.Requests;

public class GetVariantsRequest : GraphQLRequest
{
    public GetVariantsRequest(string path, string language)
    {
        Query = @"query GetVariants($path: String!,$language: String!){
                          item(path: $path, language: $language) {
                            personalization {
                              variantIds
                            }
                          }
                        }";
        Variables = new
        {
            path,
            language
        };
    }
}
