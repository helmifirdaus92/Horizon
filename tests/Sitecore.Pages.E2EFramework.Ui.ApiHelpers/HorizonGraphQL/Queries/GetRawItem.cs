// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Queries;

public class GetRawItem : GraphQLRequest
{
    public GetRawItem(string path, string language, string site, bool enableItemFiltering = true, string[] roots = null, string[] baseTemplateIds = null)
    {
        Query = @"query GetRawItem($path: String!, $roots: [String!]! , $baseTemplateIds: [String!]!, $language: String!, $site: String!, $enableItemFiltering: Boolean) {
            rawItem(
                path: $path
                language: $language
                site: $site
                enableItemFiltering: $enableItemFiltering
            ) {
                id
                name
                language
                version
                displayName
                icon
                path
                hasChildren
                template{
                    id
                    name
                }
                children {
                    id
                    name
                    hasChildren
                    children {
                        id
                        name
                    }
                }
                ancestorsWithSiblings(roots: $roots)
                {
                    id,
                    displayName,
                    parentId,
                    isFolder,
                    template {
                        isTemplateDescendantOfAny(baseTemplateIds: $baseTemplateIds)
                        id,
                        name,
                        path,
                    }
                }
            }
        }";
        Variables = new
        {
            path,
            language,
            site,
            enableItemFiltering,
            roots = roots ?? Array.Empty<string>(),
            baseTemplateIds = baseTemplateIds ?? Array.Empty<string>()
        };
    }
}
