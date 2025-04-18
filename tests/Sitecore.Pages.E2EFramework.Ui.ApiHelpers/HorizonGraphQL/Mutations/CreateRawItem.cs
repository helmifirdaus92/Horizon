// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class CreateRawItem : GraphQLRequest
{
    public CreateRawItem(string parentId, string itemName, string templateId, string language, string site)
    {
        Query = @"mutation CreateRawItem($language: String!, $site: String!, $parentId: String!, $itemName: String!, $templateId: String!) {
            createRawItem(input: { 
                language: $language,
                site: $site,
                parentId: $parentId,
                itemName: $itemName,
                templateId: $templateId
            })
            {
            rawItem {
                  id
                  displayName
                  path
            }
            success
          }
        }";
        Variables = new
        {
            language,
            site,
            parentId,
            itemName,
            templateId
        };
    }
}
