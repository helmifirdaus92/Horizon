// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.HorizonGraphQL.Mutations;

public class ExecuteWorkflowCommand : GraphQLRequest
{
    public ExecuteWorkflowCommand(string itemId, string commandId, string comments, int itemVersion, string language, string site)
    {
        Query = @"mutation ExecuteWorkflowCommand($language: String!, $site: String!, $itemId: String!, $itemVersion: Int, $comments: String, $commandId: String!) {
            executeWorkflowCommand(
                input: {
                    language: $language
                    site: $site
                    itemId: $itemId
                    itemVersion: $itemVersion
                    comments: $comments
                    commandId: $commandId
                }
            ) {
                completed
                error
                item {
                    id
                    name
                    path
                    version
                    language
                }
                nextStateId
                pageWorkflowValidationResult {
                  defaultDatasourceItemsResult {
                    fieldRulesResult {
                      fieldItemId
                      fieldName
                      records{
                        errors
                        validatorDescription
                        validatorResult
                        validatorText
                        validatorTitle
                      }
                    }
                  }
                  pageItemResult{
                    fieldRulesResult {
                      fieldItemId
                      fieldName
                      records{
                        errors
                        validatorDescription
                        validatorResult
                        validatorText
                        validatorTitle
                      }
                    }
                  }
                  personalizedDatasourceItemsResult{
                    fieldRulesResult {
                      fieldItemId
                      fieldName
                      records{
                        errors
                        validatorDescription
                        validatorResult
                        validatorText
                        validatorTitle
                      }
                    }
                  }
                }
            }
        }";
        Variables = new
        {
            itemId,
            commandId,
            comments,
            itemVersion,
            language,
            site
        };
    }
}
