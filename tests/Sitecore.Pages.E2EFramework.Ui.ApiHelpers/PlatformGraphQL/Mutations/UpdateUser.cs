// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class UpdateUser : GraphQLRequest
{
    public UpdateUser(string userName, List<string> roles)
    {
        Query = @"mutation UpdateUser($userName: String!, $roles: [String]!)  {
                              updateUser(
                                input: {
                                  userName: $userName
                                  roleNames: $roles
                                }
                              ) {
                                user{
                                 name
                                 profile{email}}}
                              }";
        Variables = new
        {
            userName,
            roles
        };
    }
}
