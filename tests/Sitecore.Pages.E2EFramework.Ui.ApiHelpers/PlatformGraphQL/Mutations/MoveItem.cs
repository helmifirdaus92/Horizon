// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class MoveItem : GraphQLRequest
{
    public MoveItem(string itemId, string targetParentPath, string databaseName = "master")
    {
        Query = @"mutation moveItem($itemId: ID, $targetParentPath: String, $database: String){
                      moveItem(
                      input: {
                          itemId: $itemId,
                          targetParentPath: $targetParentPath,
                          database: $database
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
            targetParentPath,
            databaseName
        };
    }
}
