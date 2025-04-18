// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class CreateItemTemplate : GraphQLRequest
{
    public CreateItemTemplate(string templateName, string parentId, List<string> baseTemplates)
    {
        Query = @"mutation CreateItemTemplate($templateName: String!, $parentId: ID!, $baseTemplates: [ID]!) {
                          createItemTemplate(
                            input: {
                              name: $templateName
                              parent: $parentId
                              baseTemplates: $baseTemplates
                            }
                          ) {
                            itemTemplate {
                              name
                              templateId
                            }
                          }
                        }";
        Variables = new
        {
            templateName,
            parentId,
            baseTemplates
        };
    }
}
