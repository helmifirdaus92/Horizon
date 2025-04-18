// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class RenameItem : GraphQLRequest
{
    public RenameItem(string itemId, string newName)
    {
        Query = @"mutation renameItem($itemId: ID, $newName: String){
                      renameItem(
                      input: {
                          itemId: $itemId,
                          newName: $newName
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
            newName
        };
    }
}
