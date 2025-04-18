// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class SaveItem : GraphQLRequest
{
    public SaveItem(string itemId, int itemVersion, string revision, string kind, string presentationDetails, string originalPresentationDetails, string language, string site)
    {
        Query = @"mutation Save($language: String!, $site: String!, $itemId: String, $itemVersion: Int, $revision: String, $kind: LayoutKind!, $presentationDetails: String!, $originalPresentationDetails: String!) {
            saveItem(input: { 
                language: $language,
                site: $site,
                items: [
                {
                    itemId: $itemId,
                    itemVersion: $itemVersion,
                    revision: $revision,
                    presentationDetails:
                    {
                        kind: $kind,
                        body: $presentationDetails
                    },
                    originalPresentationDetails:
                    {
                        kind: $kind,
                        body: $originalPresentationDetails
                    }
                }
                ]
            })
            {
                errors {
                  errorCode
                  itemId
                  message
                }
                newCreatedVersions {
                  displayName
                  itemId
                  versionNumber
                }
                savedItems {
                  fields
                  {
                    id
                    originalValue
                    value
                  }      
                  
                  id
                  language
                  revision
                  version
                }
                validationErrors {
                  aborted
                  errorLevel
                  errorMessage
                  fieldId
                }
                warnings
            }
        }";
        Variables = new
        {
            language,
            site,
            itemId,
            itemVersion,
            revision,
            kind,
            presentationDetails,
            originalPresentationDetails
        };
    }
}
