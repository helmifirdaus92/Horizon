// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries
{
    public class Search : GraphQLRequest
    {
        // in current implementation returns only totalCount of searched items
        public Search(string searchInput, SearchCriteriaInput[] pathCriteria)
        {
            Query = @"
                query SearchDesign($searchInput: String!, $pathCriteria: [SearchCriteriaInput]) {
                search(
                  query: {
                    filterStatement: {
                      criteria: [
                        { field: ""_name"", value: $searchInput, criteriaType: CONTAINS }
                        { field: ""_displayname"", value: $searchInput, criteriaType: CONTAINS }
                      ]
                      subStatements: { criteria: $pathCriteria, operator: MUST }
                    }
                    sort: { field: ""_name"", direction: ASCENDING }
                  }
                ) {
                  totalCount
                  results {
                    itemId
                    name
                    path
                    parentId
                  }
                }
              }";
            Variables = new
            {
                searchInput,
                pathCriteria
            };
        }
    }

    public class SearchCriteriaInput
    {
        public string field;
        public string value;
        // can be 'CONTAINS' | 'EXACT';
        public string criteriaType;
    }
}
