// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Queries;

public class GetTenantTemplates : GraphQLRequest
{
    public GetTenantTemplates(string siteName)
    {
        Query = @"query GetTenantTemplates($siteName: String!) {
                      tenantTemplates(where: {siteName:$siteName}){
                        pageDesign {name}
                        template {
                             templateId
                             name  
                        }
                      }
                    }";
        Variables = new
        {
            siteName
        };
    }
}
