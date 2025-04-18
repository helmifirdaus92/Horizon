// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations
{
    public class CreateItem : GraphQLRequest
    {
        public CreateItem(string name, string parent, string templateId, string displayName = "", string database = "master", string language = "en")
        {
            Query = @"mutation createItem($database: String!, $name: String!,$displayName:String!, $parent: ID!, $templateId: ID!, $language: String!){
                      createItem(
                      input: {
                          database: $database,
                          name: $name,
                          parent: $parent,
                          templateId: $templateId,
                          language: $language,
                          fields: [{ name: ""__Display name"", value: $displayName }]
                        }
                      ) {
                        item {
                          itemId
                          name
                          path 
                        }
                      }
                    }";
            Variables = new
            {
                database,
                name,
                parent,
                templateId,
                language,
                displayName
            };
        }
    }
}
