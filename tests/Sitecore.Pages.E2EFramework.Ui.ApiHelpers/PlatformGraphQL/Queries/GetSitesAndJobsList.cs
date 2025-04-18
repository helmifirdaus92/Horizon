// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetSitesAndJobsList : GraphQLRequest
{
    public GetSitesAndJobsList(string jobName, string database = "master")
    {
        Query = @"query GetSitesAndJobsList ($database: String!, $jobName: String!) {
                        jobs(input: {jobName: $jobName}) {
                            nodes {
                              name
                              done
                              queueTime
                              __typename
                            }
                            __typename
                          }
                        solutionSites(input: {
                              database: $database
                              }) {
                            id
                            displayName
                            name
                            thumbnailUrl
                            __typename
                          }
                        }";
        Variables = new
        {
            jobName,
            database
        };
    }
}
