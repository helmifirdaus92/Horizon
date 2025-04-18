// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetMediaFolderAncestors : GraphQLRequest
{
    public GetMediaFolderAncestors(string path, List<string> sources, string language = "en", string site = "SXAHeadlessSite")
    {
        Query = @"query MediaFolderAncestors($language: String!, $site: String!, $path: String!, $sources: [String!]!){
                      mediaFolderAncestors(
                            path: $path,
                            sources: $sources,
                            language: $language,
                            site: $site
                        ){
                        children {
                          children {
                            id
                            displayName
                            hasChildren
                          }
                          displayName
                          hasChildren
                          id
                          parentId
                          permissions {
                            canCreate
                            canDelete
                            canRename
                          }
                        }
                        displayName
                        hasChildren
                        id
                        parentId
                        permissions {
                          canCreate
                          canDelete
                          canRename
                        }
                       }
                    }";
        Variables = new
        {
            path,
            sources,
            language,
            site
        };
    }
}
