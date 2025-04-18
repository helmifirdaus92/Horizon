// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations
{
    public class DeleteItem : GraphQLRequest
    {
        public DeleteItem(string itemId, string path)
        {
            Query = @"mutation deleteItem($itemId: ID, $path: String){
                      deleteItem(
                      input: {
                          itemId: $itemId,
                          path: $path
                        }
                      ) {
                        successful
                      }
                    }";
            Variables = new
            {
                itemId,
                path
            };
        }
    }
}
