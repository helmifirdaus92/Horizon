// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class CreateFolder : GraphQLRequest
{
    public CreateFolder(string parentId, string folderName, string templateId, string language, string site)
    {
        Query = @"mutation CreateFolder($language: String!, $site: String!, $parentId: String!, $folderName: String!, $templateId: String!) {
            createFolder(
                input: {
                    language: $language
                    site: $site
                    parentId: $parentId
                    folderName: $folderName
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
            folderName,
            templateId
        };
    }
}
