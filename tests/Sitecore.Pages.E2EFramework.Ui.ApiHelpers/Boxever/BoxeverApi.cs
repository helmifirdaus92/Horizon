// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Text.Json;
using RestSharp;
using Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Boxever.Models;

namespace Sitecore.Pages.E2EFramework.UI.Tests.ApiHelpers.Boxever
{
    public class BoxeverApi
    {
        public readonly RestClient _client;

        public BoxeverApi(string baseUrl)
        {
            _client = new RestClient(baseUrl);
        }

        public FlowDefinition CreateAFlowDefinitionForPage(string pageId, string pageName, string siteId, string language = "en")
        {
            var request = new RestRequest("flowDefinitions");
            request.AddBody(BuildNewFlowDefinition(pageId, pageName, siteId, language));

            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
            var response = _client.ExecutePost(request);
            return JsonSerializer.Deserialize<FlowDefinition>(response.Content);
        }

        public FlowDefinition UpdateFlowDefinition(FlowDefinition flowDefinition)
        {
            var request = new RestRequest($"flowDefinitions/{flowDefinition.@ref}");
            request.AddBody(flowDefinition);

            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
            var response = _client.ExecutePut(request);
            return JsonSerializer.Deserialize<FlowDefinition>(response.Content);
        }
        public FlowDefinition AddAVariantToFlowDefinition(FlowDefinition flowDefinition)
        {
            var request = new RestRequest($"flowDefinitions/{flowDefinition.@ref}");
            request.AddBody(UpdateFlowDefinitionWithASplit(flowDefinition));

            request.AddHeader("Content-Type", "application/json");
            request.AddHeader("Authorization", $"Bearer {Settings.TenantAccessToken}");
            var response = _client.ExecutePut(request);
            return JsonSerializer.Deserialize<FlowDefinition>(response.Content);
        }

        private static FlowDefinition BuildNewFlowDefinition(string pageId, string pageName, string siteId, string language = "en")
        {
            return new FlowDefinition()
            {
                siteId = siteId,
                name = $"{pageName} {language} - {pageId.ToLower()}",
                friendlyId = $"embedded_{pageId.Replace("-", "").ToLower()}_{language}",
                archived = false,
                businessProcess = "interactive_v1",
                channels = new List<string>()
                {
                    "WEB"
                },
                status = "DRAFT",
                subtype = "EXPERIENCE",
                traffic = new FlowDefinition.Traffic()
                {
                    type = "audienceTraffic",
                    weightingAlgorithm = "USER_DEFINED",
                    splits = new List<FlowDefinition.Split>()
                },
                schedule = new FlowDefinition.Schedule()
                {
                    type = "simpleSchedule",
                    startDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                },
                sampleSizeConfig = new FlowDefinition.SampleSizeConfig()
                {
                    baseValue = 0.15,
                    minimumDetectableDifference = 0.02,
                    confidenceLevel = 0.95
                },
                tags = new List<object>(),
                triggers = new List<object>(),
                type = "INTERACTIVE_API_FLOW",
                variants = new List<object>()
            };
        }

        private static FlowDefinition UpdateFlowDefinitionWithASplit(FlowDefinition flowDefinition)
        {
            var variantId = Guid.NewGuid().ToString().ToLower().Replace("-", "");
            flowDefinition.traffic.splits = new List<FlowDefinition.Split>()
            {
                new FlowDefinition.Split
                {
                    variantName = "Test_Variant_PagesAutoTest",
                    audienceName = "Test_Audience_PagesAutoTest",
                    conditionGroups = new List<FlowDefinition.ConditionGroup>()
                    {
                        new ()
                        {
                            conditions = new List<FlowDefinition.Condition>()
                            {
                                new()
                                {
                                    templateId = "country_region",
                                    @params = new FlowDefinition.Params()
                                    {
                                        @is = "is",
                                        country = "US",
                                        regions = "AL"
                                    },
                                    templateFriendlyId = "country_region",
                                    templateRevision = 2,
                                    conditionFriendlyId = "country_region"
                                }
                            }
                        }
                    },
                    template = $"{{\"variantId\": \"{variantId}\"}}"
                }
            };
            flowDefinition.status = "PRODUCTION";
            return flowDefinition;
        }
    }
}
