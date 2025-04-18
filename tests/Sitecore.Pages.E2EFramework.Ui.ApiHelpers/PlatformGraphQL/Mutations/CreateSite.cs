// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class CreateSite : GraphQLRequest
{
    public CreateSite(string siteName, string templateId = "{5AAE1EEA-EA24-40BF-96F1-1F43DA82C77B}",
        string hostName = "*", string language = "en", string database = "master")
    {
        {
            Query = @"mutation createSite(
                    $database: String!, $hostName: String!, $language: String!, $siteName: String!, $templateId: String!) {
                      scaffoldSolution(input: {database: $database, hostName: $hostName, language: $language, siteName: $siteName, templateId: $templateId}) {
                        job {
                          name
                          handle
                          done
                        }
                      }
                    } ";
            Variables = new
            {
                database,
                hostName,
                language,
                siteName,
                templateId
            };
        }
    }
}
