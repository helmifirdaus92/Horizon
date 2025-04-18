// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetMediaItem : GraphQLRequest
{
    public GetMediaItem(string path, string[] sources = null, string language = "en", string site = "SXAHeadlessSite")
    {
        Query = @"
                query GetMediaItem($path: String!, $sources: [String!]!, $language: String!, $site: String!) {
                    mediaItem(path:$path, sources:$sources, language:$language, site:$site) {
                        alt,
                        dimensions,
                        displayName,
                        extension,
                        hasMediaStream,
                        height,
                        id,
                        mimeType,
                        parentId,
                        path,
                        size,
                        url,
                        width
                    }
                }";
        Variables = new
        {
            path,
            language,
            site,
            sources = sources ?? Array.Empty<string>()
        };
    }
}
