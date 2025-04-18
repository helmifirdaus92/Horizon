// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetMediaFolderItem : GraphQLRequest
{
    public GetMediaFolderItem(string path = null, string language = "en", string site = "SXAHeadlessSite")
    {
        Query = @"query MediaFolderItem($language: String!, $site: String!, $path: String){
                      mediaFolderItem(
                            path: $path,
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
            language,
            site
        };
    }
}
