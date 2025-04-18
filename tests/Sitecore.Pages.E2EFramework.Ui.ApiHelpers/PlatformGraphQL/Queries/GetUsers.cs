// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetUsers : GraphQLRequest
{
    public GetUsers()
    {
        Query = @"query {users(first: 50, last: 100) {
                            nodes {
                              profile {
                                userName
                                email
                                isAdministrator
                              }
                            }
                          }
                        }";
    }
}
