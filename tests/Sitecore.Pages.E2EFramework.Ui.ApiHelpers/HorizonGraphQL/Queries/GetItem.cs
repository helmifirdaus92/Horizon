// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetItem : GraphQLRequest
{
    /// <param name="path">Item path or ID</param>
    /// <param name="language">Item language</param>
    /// <param name="site"></param>
    /// <param name="version">Item version</param>
    /// <param name="enableItemFiltering">Controls whether item filtering should be enabled. When enabled, non-publishable versions of item are omitted (default behavior).</param>
    public GetItem(string path, string language, string site, int? version, bool enableItemFiltering)
    {
        Query = @"query GetItem($path: String!, $language: String!, $site: String!, $version: Int, $enableItemFiltering: Boolean) {
            item(
                path: $path
                language: $language
                site: $site
                version: $version
                enableItemFiltering: $enableItemFiltering
            ) {
                ancestors {
                    id
                    name
                    path
                }
                children {
                  hasChildren
                  id
                  name
                  path
                }
                createdBy
                creationDate
                displayName
                hasChildren
                icon
                id
                insertOptions(kind: ITEM) {
                  displayName
                  id
                }
                isLatestPublishableVersion
                language
                locking {
                  canUnlock
                  isLocked
                  lockedBy
                  lockedByCurrentUser
                }
                name
                parent {
                  id
                  name
                  path
                }
                path
                permissions {
                  canCreate
                  canDelete
                  canPublish
                  canRename
                  canWrite
                }
                publishing {
                  hasPublishableVersion
                  isAvailableToPublish
                  isPublishable
                  validFromDate
                  validToDate
                }
                revision
                template {
                  displayName
                  id
                  name
                  path
                }
                updatedBy
                updatedDate
                version
                versionName
                versions {
                  createdBy
                  creationDate
                  displayName
                  hasChildren
                  icon
                  id
                  isLatestPublishableVersion
                  language
                  revision
                  updatedBy
                  updatedDate
                  version
                  versionName
                }
                workflow {
                  canEdit
                  commands {
                    displayName
                    id
                  }
                  displayName
                  finalState
                  icon
                  id
                  warnings {
                    errorCode
                    message
                  }
                }
            }
        }";
        Variables = new
        {
            path,
            language,
            site,
            version,
            enableItemFiltering
        };
    }
}
