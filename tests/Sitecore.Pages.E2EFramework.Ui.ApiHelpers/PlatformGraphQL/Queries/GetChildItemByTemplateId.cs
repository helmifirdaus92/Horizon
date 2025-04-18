// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetChildItemByTemplateId : GraphQLRequest
{
    public GetChildItemByTemplateId(string path, string language, string childTemplateId)
    {
        Query = $@"
    query GetItem() {{
        item(where: {{ path: ""{path}"", language: ""{language}"" }}) {{
            itemId
            name
            displayName
            createdAt: field(name: ""__Created"") {{
                value
            }}
            updatedAt: field(name: ""__Updated"") {{
                value
            }}
            children(includeTemplateIDs: [""{childTemplateId}""]) {{
                nodes {{
                    itemId
                    path
                }}
            }}
        }}
    }}";

    }
}
