// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class DeleteItem : GraphQLRequest
{
    public DeleteItem(string path, string language, string site, bool deletePermanently)
    {
        Query = @"mutation DeleteItem($language: String, $site: String, $path: String!, $deletePermanently: Boolean) {
            deleteItem(
                input: {
                    path: $path
                    language: $language
                    site: $site
                    deletePermanently: $deletePermanently
                }
            ) {
                success
            }
        }";
        Variables = new
        {
            language,
            site,
            path,
            deletePermanently
        };
    }
}
