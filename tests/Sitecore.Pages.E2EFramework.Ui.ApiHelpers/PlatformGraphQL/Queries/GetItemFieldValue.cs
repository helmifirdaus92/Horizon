// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetItemFieldValue : GraphQLRequest
{
    public GetItemFieldValue(string path, string fieldName, string language)
    {
        Query = @"
    query GetItem($path: String!, $language: String!, $fieldName: String!) {
        item(where: { path: $path, language: $language }) {
            layout : field (name: $fieldName)
            {
                value
            }
        }
    }";
        Variables = new
        {
            path = path,
            language = language,
            fieldName = fieldName
        };
    }
}
