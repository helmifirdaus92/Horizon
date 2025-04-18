// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class UpdateItem : GraphQLRequest
{
    public UpdateItem(string itemId, string fieldName, string fieldValue, string language, int version)
    {
        Query = @"mutation UpdateItem($itemId: ID!, $fieldName: String!, $fieldValue: String!, $language: String!, $version: Int)  {
                      updateItem(
                        input: {
                          itemId: $itemId
                          language: $language
                          fields: [
                            {
                              name: $fieldName
                              value: $fieldValue
                            }
                          ]
                          version: $version
                        }
                      ) {
                        item {
                          name
                          field(name: $fieldName) {
                            value
                          }
                        }
                      }
                    }
                    ";
        Variables = new
        {
            itemId,
            fieldName,
            fieldValue,
            language,
            version
        };
    }
}
