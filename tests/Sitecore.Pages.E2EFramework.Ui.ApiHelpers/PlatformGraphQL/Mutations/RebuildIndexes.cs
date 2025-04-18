// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class RebuildIndexes : GraphQLRequest
{
    public RebuildIndexes(List<string> indexNames)
    {
        Query = @"mutation rebuildIndexes($indexNames: [String!]!){
                      rebuildIndexes(
                      input: {
                          indexNames: $indexNames
                      }
                      ) {
                      jobs {
                          displayName
                          done
                          handle
                          metadata {
                            key
                            value
                          }
                          name
                          options {
                            abortable
                            category
                            jobName
                            siteName
                          }
                          queueTime
                          status {
                            exceptions
                            expiry
                            jobState
                            messages
                            processed
                            total
                          }
                        }
                      }
                    }";
        Variables = new
        {
            indexNames
        };
    }
}
