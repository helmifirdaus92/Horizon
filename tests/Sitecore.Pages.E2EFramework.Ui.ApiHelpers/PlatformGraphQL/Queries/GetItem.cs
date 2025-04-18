// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries
{
    public class GetItem : GraphQLRequest
    {
        public GetItem(string path, string language, int? version = 1)
        {
            Query = @"query GetItem($path: String!, $language: String!, $version:Int!) {
                            item(where: { path: $path, language: $language, version:$version }) {
                                itemId
                                name
                                displayName
                                path
                                children {
                                    nodes {
                                        itemId
                                        path
                                        name
                                    }
                                }
                                template {
                                      templateId
                                      name
                                }
                                createdAt: field(name: ""__Created"") {
                                    value
                                }
                                updatedAt: field(name: ""__Updated"") {
                                    value
                                }
                                versions (allLanguages: false){
                                  language{
                                    name
                                  }
                                  versionName
                                  version
                                  publishableFrom: field(name: ""__Valid from"") {
                                    value
                                  }
                                  publishableTo: field(name: ""__Valid to"") {
                                    value
                                  }
                                  isPublishable: field(name: ""__Hide version"") {
                                    value
                                  }
                                  workflow {
                                    workflowState {
                                      final
                                      displayName
                                    }
                                  }
                                }
                                workflow {
                                  workflowState {
                                    final
                                    displayName
                                    stateId
                                  }
                                  workflow {
                                    displayName
                                  }
                                }
                            }
                        }";
            Variables = new
            {
                path,
                language,
                version
            };
        }
    }
}
