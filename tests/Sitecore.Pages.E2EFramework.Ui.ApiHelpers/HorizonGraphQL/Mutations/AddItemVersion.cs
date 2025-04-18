// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class AddItemVersion : GraphQLRequest
{
    public AddItemVersion(string path, string versionName, int baseVersionNumber, string language, string site)
    {
        Query = @"mutation AddItemVersion($language: String!, $site: String!, $path: String!, $versionName: String, $baseVersionNumber: Int) {
            addItemVersion(
                input: {
                    language: $language
                    site: $site
                    path: $path
                    versionName: $versionName
                    baseVersionNumber: $baseVersionNumber
                }
            ) {
                item {
                    id
                    name
                    path
                    createdBy
                    language
                    parent {
                        name
                        path
                    }
                    template {
                        path
                    }
                    version
                }
                success
            }
        }";
        Variables = new
        {
            language,
            site,
            path,
            versionName,
            baseVersionNumber
        };
    }
}
