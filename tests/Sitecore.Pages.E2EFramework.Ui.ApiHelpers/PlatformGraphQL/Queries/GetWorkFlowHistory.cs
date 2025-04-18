// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetWorkFlowHistory : GraphQLRequest
{
    public GetWorkFlowHistory(string workflowId, string itemId)
    {
        Query = @"query GetWorkFlowHistory($workflowId: String!, $itemId: String!) {
                          workflow(where: { workflowId: $workflowId }) {
                            history(item: { itemId: $itemId }) {
                              nodes {
                                comments
                                newState {
                                  displayName
                                }
                                oldState {
                                  displayName
                                }
                                user
                              }
                            }
                          }
                        }";
        Variables = new
        {
            workflowId,
            itemId
        };
    }
}
