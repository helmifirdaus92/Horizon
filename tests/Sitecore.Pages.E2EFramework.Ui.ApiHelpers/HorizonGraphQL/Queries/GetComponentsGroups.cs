// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetComponentsGroups : GraphQLRequest
{
    public GetComponentsGroups(string site)
    {
        Query = @"
                query GetComponentsGroups($site: String!){
                components(site:$site){
                ungrouped {
                  id
                  displayName
                  iconUrl
                  category
                  categoryId
                  componentName
                }
                groups {
                  title
                  components {
                    id
                    displayName
                    iconUrl
                    category
                    categoryId
                    componentName
                  }
                }
              }
            }";

        Variables = new
        {
            site = site
        };
    }
}
