// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class UpdateItemTemplate : GraphQLRequest
{
    public UpdateItemTemplate(string templateId, List<string> baseTemplates)
    {
        Query = @"mutation UpdateItemTemplate($templateId: ID!, $baseTemplates: [ID]!) {
                          updateItemTemplate(
                            input: {
                              templateId: $templateId
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
            templateId,
            baseTemplates
        };
    }
}
