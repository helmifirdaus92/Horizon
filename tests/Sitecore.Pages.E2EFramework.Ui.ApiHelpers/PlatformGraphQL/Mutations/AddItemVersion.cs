// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class AddItemVersion : GraphQLRequest
{
    public AddItemVersion(string path, string language = "en")
    {
        {
            Query = @"mutation addItemVersion($path: String!, $language: String!){
                      addItemVersion(
                      input: {
                          path: $path,
                          language: $language
                        }
                      ) {
                        item {
                          itemId
                          path
                          version
                          versions(allLanguages: true) {
                            version
                          }
                        }
                      }
                    } ";
            Variables = new
            {
                path,
                language
            };
        }
    }
}
