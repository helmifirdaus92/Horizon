// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetPageDesigns : GraphQLRequest
{
    public GetPageDesigns(string siteName)
    {
        Query = @"query GetPageDesigns($siteName: String!) {
                    pageDesigns(where: { siteName: $siteName }) {
                        pageDesign {
                          path
                          itemId
                          name
                        }
                      }
                    }";
        Variables = new
        {
            siteName
        };
    }
}
