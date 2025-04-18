// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class MoveItem : GraphQLRequest
{
    public MoveItem(string itemToMoveId, string targetId, string position, string site)
    {
        Query = @"mutation MoveItem($itemToMoveId: String!, $targetId: String!, $position: MovePosition!, $site: String!) {
            moveItem(
                input: {
                    itemToMoveId: $itemToMoveId
                    targetId: $targetId
                    position: $position
                    site: $site
                }
            ) {
                success
            }
        }";
        Variables = new
        {
            itemToMoveId,
            targetId,
            position,
            site
        };
    }
}
