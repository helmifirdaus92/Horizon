// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class CopyItem : GraphQLRequest
{
    public CopyItem(string copyItemName, string itemId, string targetParentId)
    {
        Query = @"mutation copyItem($copyItemName: String!, $itemId: ID!, $targetParentId: ID!){
                      copyItem(input: {
                                 copyItemName:$copyItemName,
                                 itemId:$itemId,
                                 targetParentId:$targetParentId}
                                ){
                            item{
                              itemId
                              name
                              path}
                      }
                    }";
        Variables = new
        {
            copyItemName,
            itemId,
            targetParentId
        };
    }
    
}
