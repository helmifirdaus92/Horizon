// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetItemTemplate : GraphQLRequest
{
    public GetItemTemplate(string path)
    {
        Query = @"query GetItemTemplates($path: String!) {
                      itemTemplate(where: {path:$path}){
                        templateId
                      }
                    }";
        Variables = new
        {
            path
        };
    }
}
