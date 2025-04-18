// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetPartialDesignsRoot : GraphQLRequest
{
    public GetPartialDesignsRoot(string siteName)
    {
        Query = @"query GetPartialDesignsRoot($siteName: String!){
                          partialDesignsRoots(where: { siteName: $siteName }) {
                                root {
                                  children {
                                    nodes {
                                      path
                                      itemId
                                      name
                                      displayName
                                    }
                                  }
                                }
                                siteName
                              }
                            }";
        Variables = new
        {
            siteName
        };
    }
}
