// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries
{
    internal class GetSolutionSites : GraphQLRequest
    {
        public GetSolutionSites(bool includeNonSxaSites)
        {
            Query = @"query GetSolutionSites ($includeNonSxaSites: Boolean!) {
                        solutionSites(input: { includeNonSxaSites: $includeNonSxaSites }) {
                            name
                            language {
                                name
                            }
                            rootItem {
                                itemId
                            }
                            startItem {
                                itemId
                            }
                            posMappings {
                                language
                                name
                            }
                            properties {
                                key
                                value
                            }
                            renderingHost {
                                appName
                                layoutServiceConfiguration
                                serverSideRenderingEngineEndpointUrl
                                serverSideRenderingEngineApplicationUrl
                            }
                          }
                        }";
            Variables = new
            {
                includeNonSxaSites
            };
        }
    }
}
