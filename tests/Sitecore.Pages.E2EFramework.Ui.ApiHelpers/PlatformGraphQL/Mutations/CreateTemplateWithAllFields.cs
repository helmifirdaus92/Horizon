// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using GraphQL.Common.Request;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.PlatformGraphQL.Mutations;

public class CreateTemplateWithAllFields : GraphQLRequest
{
    public CreateTemplateWithAllFields(string templateName, string parentId, string[] baseTemplates)
    {
        Query = @" mutation CreateItemTemplate($templateName: String!, $parentId: ID!, $baseTemplates: [ID]) {
              createItemTemplate(
                input: { 
                  name: $templateName
                  baseTemplates: $baseTemplates
                  parent: $parentId
                  createStandardValuesItem: true
                  sections: [{
                    name: ""Content""
                    fields: [
                      {
                        name: ""Title""
                        type: ""Single-Line Text""
                        sortOrder: 1
                        defaultValue: ""$name""
                      }
                      {
                         name: ""Integer""
                         type: ""Integer"" 
                      }
                      {
                        name: ""Number""
                        type: ""Number""
                      }
                      {
                        name: ""General Link""
                        type: ""General Link""
                      }
                      {
                        name: ""Rich Text""
                        type: ""Rich Text""
                        source: ""query:$xaRichTextProfile""
                      }
                      {
                        name: ""Multi-line Text""
                        type: ""Multi-line Text""
                      }
                      {
                        name: ""Image""
                        type: ""Image""
                      }
                      {
                        name: ""File""
                        type: ""File""
                      }
                      {
                        name: ""Date""
                        type: ""Date""
                      }
                      {
                        name: ""DateTime""
                        type: ""DateTime""
                      }
                      {
                        name: ""Droplist""
                        type: ""Droplist""
                      }
                      {
                        name: ""Grouped Droplist""
                        type: ""Grouped Droplist""
                      }
                      {
                        name: ""Droplink""
                        type: ""Droplink""
                      }
                      {
                        name: ""Grouped Droplink""
                        type: ""Grouped Droplink""
                      }
                      {
                        name: ""Droptree""
                        type: ""Droptree""
                      }
                      {
                        name: ""Taglist""
                        type: ""Taglist""
                      }
                      {
                        name: ""Checklist""
                        type: ""Checklist""
                      }
                      {
                        name: ""Multilist""
                        type: ""Multilist""
                      }
                      {
                        name: ""Treelist""
                        type: ""Treelist""
                      }
                      {
                        name: ""Multiroot Treelist""
                        type: ""Multiroot Treelist""
                      }
                      {
                        name: ""Checkbox""
                        type: ""Checkbox""
                      }
                      {
                        name: ""TreelistEx""
                        type: ""TreelistEx""
                      }
                      {
                        name: ""iFrame""
                        type: ""IFrame""
                      }
                    ]
                  }]
                  
                })
              {
                itemTemplate {

                  fullName
                  name
                  standardValuesItem(language: ""en""){
                    itemId
                  }
                  templateId(format: N)
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
