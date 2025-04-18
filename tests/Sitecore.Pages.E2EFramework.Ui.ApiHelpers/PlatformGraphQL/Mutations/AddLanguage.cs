// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class AddLanguage : GraphQLRequest
{
    public AddLanguage(string languageCode, string regionCode = "")
    {
        Query = @"mutation addLanguage($languageCode: String!,$regionCode: String!){
                      addLanguage(
                      input: {
                          languageCode: $languageCode
                          regionCode: $regionCode
                        }
                      ) {
                        successful
                      }
                    }";
        Variables = new
        {
            languageCode,
            regionCode
        };
    }
}
