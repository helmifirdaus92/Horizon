// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries
{
    public class GetItemLayoutFinalRendering : GraphQLRequest
    {
        public GetItemLayoutFinalRendering(string path, string language, int? version = null)
        {
            Query = @"
    query GetItem($path: String!, $language: String!) {
        item(where: { path: $path, language: $language }) {
            layout : field (name: ""__Final Renderings"")
            {
                value
            }
        }
    }";
            Variables = new
            {
                path = path,
                language = language
            };
        }
    }
}
