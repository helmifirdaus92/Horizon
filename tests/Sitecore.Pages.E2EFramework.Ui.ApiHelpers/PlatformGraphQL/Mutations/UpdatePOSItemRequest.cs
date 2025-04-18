// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class UpdatePOSItemRequest : GraphQLRequest
{
    public UpdatePOSItemRequest(string path, string fieldName, string fieldValue,
        string language = "en", string database = "master", int version = 1)
    {
        {
            Query = @"mutation updateItem(
                     $database:String!,$language:String!,$version:Int!,$fieldValue:String!,$fieldName:String!,$path:String!){
                     updateItem(input: {
                                database:$database,
                                language:$language,
                                version:$version,
                                path:$path
                                fields:[{name:$fieldName,value:$fieldValue }]
                              }){
                                item{displayName}
                              }
                            }";
            Variables = new
            {
                database,
                language,
                path,
                fieldName,
                fieldValue,
                version
            };
        }
    }
}
