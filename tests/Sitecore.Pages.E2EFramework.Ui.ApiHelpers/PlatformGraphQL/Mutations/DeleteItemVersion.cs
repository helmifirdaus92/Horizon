// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class DeleteItemVersion : GraphQLRequest
{
    public DeleteItemVersion(string itemId, int version)
    {
        Query = @"mutation deleteItemVersion($itemId: ID, $version: Int){
                      deleteItemVersion(
                      input: {
                          itemId: $itemId,
                          version: $version
                        }
                      ) {
                        item {
                          itemId
                          name
                          path
                        }
                      }
                    }";
        Variables = new
        {
            itemId,
            version
        };
    }
}
