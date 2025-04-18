// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class UploadMedia : GraphQLRequest
{
    public UploadMedia(string filename, string extension, string blob,
        string destinationFolderId, string site = "SXAHeadlessSite", string language = "en")
    {
        Query = @"mutation UploadMedia($filename: String!, $extension: String!, $blob: String!, $destinationFolderId: String!, $site: String!, $language: String!){
                      uploadMedia(
                        input: {
                          fileName: $filename,
                          extension: $extension,
                          blob: $blob,
                          destinationFolderId: $destinationFolderId,
                          site:$site,
                          language: $language
                        }) {
                        mediaItem {
                          dimensions
                          extension
                          height
                          parentId
                          path
                          size
                          width
                          embedUrl
                          __typename
                        }
                        success
                        __typename
                      }
                    }
                    ";
        Variables = new
        {
            filename,
            extension,
            blob,
            destinationFolderId,
            site,
            language
        };
    }
}
