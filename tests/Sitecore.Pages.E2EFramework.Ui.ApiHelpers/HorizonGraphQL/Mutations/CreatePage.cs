// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class CreatePage : GraphQLRequest
{
    public CreatePage(string language, string site, string parentId, string pageName, string templateId)
    {
        Query = @"mutation CreatePage($language: String!, $site: String!, $parentId: String!, $pageName: String!, $templateId: String!) {
            createPage(
                input: {
                    language: $language
                    site: $site
                    parentId: $parentId
                    pageName: $pageName
                    templateId: $templateId
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
            parentId,
            pageName,
            templateId
        };
    }
}
