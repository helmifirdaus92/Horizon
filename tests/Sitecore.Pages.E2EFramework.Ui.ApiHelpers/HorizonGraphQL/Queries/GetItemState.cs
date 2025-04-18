// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetItemState : GraphQLRequest
{
    public GetItemState(string path, string language, string site, int version, bool withDisplayName = false, bool withWorkflow = false, bool withVersions = false, bool withPresentation = false, bool withLayoutEditingKind = false)
    {
        Query = @"query GetItemState(
                        $path: String!,
                        $language: String!,
                        $site: String!,
                        $version: Int,
                        $withDisplayName: Boolean = false,
                        $withWorkflow: Boolean = false,
                        $withVersions: Boolean = false,
                        $withPresentation: Boolean = false,
                        $withLayoutEditingKind: Boolean = false) {
                            item(path: $path, version: $version, language: $language, site: $site) {
                                id
                                displayName @include(if: $withDisplayName)
                                revision
                                ...Workflow @include(if: $withWorkflow)
                                ...Versions @include(if: $withVersions)
                                ... on Page {
                                    presentationDetails @include(if: $withPresentation)
                                    layoutEditingKind @include(if: $withLayoutEditingKind)
                                    __typename
                                }
                                __typename
                            }
                        }
                        fragment Workflow on Content {
                          workflow {
                            id
                            displayName
                            finalState
                            canEdit
                            warnings {
                              id
                              errorCode
                              message
                              __typename
                            }
                            icon
                            commands {
                              id
                              displayName
                              icon
                              __typename
                            }
                            __typename
                          }
                          isLatestPublishableVersion
                          publishing {
                            hasPublishableVersion
                            isPublishable
                            __typename
                          }
                          __typename
                        }
                        fragment Versions on Content {
                          versions {
                            version
                            isLatestPublishableVersion
                            versionName
                            updatedBy
                            updatedDate
                            publishing {
                              validFromDate
                              validToDate
                              isAvailableToPublish
                              __typename
                            }
                            workflow {
                              displayName
                              __typename
                            }
                            __typename
                          }
                          __typename
                        }
                        ";
        Variables = new
        {
            path,
            language,
            site,
            version,
            withDisplayName,
            withWorkflow,
            withVersions,
            withPresentation,
            withLayoutEditingKind
        };
    }
}
