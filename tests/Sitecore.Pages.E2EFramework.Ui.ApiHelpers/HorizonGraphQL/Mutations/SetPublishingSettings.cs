// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class SetPublishingSettings : GraphQLRequest
{
    public SetPublishingSettings(string path, int versionNumber, string validFromDate, string validToDate, bool isAvailableToPublish = true, string language = "en", string site = "SXAHeadlessSite")
    {
        Query = @"mutation SetPublishingSettings(
                        $language: String!,
                        $site: String!,
                        $path: String!,
                        $versionNumber: Int!,
                        $validFromDate: StringWithPossibleDateTimeFormatGraphType!,
                        $validToDate: StringWithPossibleDateTimeFormatGraphType!,
                        $isAvailableToPublish: Boolean!) {
            setPublishingSettings(
                input: { 
                    language: $language,
                    site: $site,
                    path: $path,
                    versionNumber: $versionNumber,
                    isAvailableToPublish: $isAvailableToPublish,
                    validFromDate: $validFromDate,
                    validToDate: $validToDate
                })
            {
                item {
                    id
                    displayName
                    name
                    version
                    versionName
                    publishing {
                      hasPublishableVersion
                      isAvailableToPublish
                      isPublishable
                      validFromDate
                      validToDate
                    }
                    isLatestPublishableVersion
                }
                success
            }
        }";
        Variables = new
        {
            language,
            site,
            versionNumber,
            validFromDate,
            validToDate,
            isAvailableToPublish,
            path
        };
    }
}
