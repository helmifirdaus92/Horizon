// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations
{
    public class ConfigurePageDesigns : GraphQLRequest

    {
        public ConfigurePageDesigns(string siteName, string templateId, string pageDesignId)
        {
            Query = @"mutation ConfigurePageDesigns($siteName: String!, $templateId: ID!, $pageDesignId: ID!)  {
                  configurePageDesigns(
                    input: {
                      siteName: $siteName,
                      mapping: [{
                        templateId: $templateId,
                        pageDesignId: $pageDesignId
                      }]
                    }
                  )
                }";
            Variables = new
            {
                siteName,
                templateId,
                pageDesignId
            };
        }
    }
}
