// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetPagePresentationDetails : GraphQLRequest
{
    public GetPagePresentationDetails(string path, string language, string site, int? version, bool enableItemFiltering)
    {
        Query = @"query GetItem($path: String!, $language: String!, $site: String!, $version: Int, $enableItemFiltering: Boolean) {
            item(
                path: $path
                language: $language
                site: $site
                version: $version
                enableItemFiltering: $enableItemFiltering
            ) {
                ...on Page
                {
                    layoutEditingKind
                    presentationDetails
                }
            }
        }";
        Variables = new
        {
            path,
            language,
            site,
            version,
            enableItemFiltering
        };
    }
}
