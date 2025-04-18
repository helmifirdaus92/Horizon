// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Newtonsoft.Json;
using DataModelTask = Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels.Task;

namespace Sitecore.Pages.E2EFramework.UI.Tests.Features.ABnTests.DataModels
{
    public class MockDataHelper
    {
        public static string ParseInstanceId(string presentationDetailsJson)
        {
            var presentationDetails = JsonConvert.DeserializeObject<dynamic>(presentationDetailsJson);
            var renderings = presentationDetails.devices[0].renderings;
            string instanceId = renderings[renderings.Count - 1].instanceId.ToString();
            string normalizedInstanceId = instanceId.ToLower().Replace("-", "");
            return normalizedInstanceId;
        }

        public static string ConstructFriendlyId(string pageId, string renderingInstanceId, string language = "en", string timestamp = null)
        {
            // Convert IDs to lowercase and remove dashes
            pageId = pageId.ToLower().Replace("-", "");
            renderingInstanceId = renderingInstanceId.ToLower().Replace("-", "");

            // Use the provided timestamp or generate a new one
            timestamp ??= DateTime.UtcNow.ToString("yyyyMMdd't'HHmmssfff'z'").ToLower();

            return $"component_{pageId}_{renderingInstanceId}_{language}_{timestamp}";
        }

        // Default variant (50%) variant B (25%) variant C (25%)
        public static string CreateAndFillMockFlowDefinitionsJson(string friendlyId, string experimentName, string siteId, string status)
        {
            MockFlowDefinitions mockFlow = new MockFlowDefinitions
            {
                FriendlyId = friendlyId,
                Name = experimentName,
                SiteId = siteId
            };

            mockFlow.Variants.Add(new Variant
            {
                Name = "Rich Text (control)",
                IsControl = true,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_default\"}"
                        }
                    }
                }
            });

            mockFlow.Variants.Add(new Variant
            {
                Name = "Variant B",
                Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184",
                IsControl = false,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_95a33bdd56b54dc4a9d882c979f1a184\"}"
                        }
                    }
                }
            });

            mockFlow.Variants.Add(new Variant
            {
                Name = "Variant C",
                Ref = "d075d8c5-e673-41f1-89ec-378729dfd601",
                IsControl = false,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_d075d8c5e67341f189ec378729dfd601\"}"
                        }
                    }
                }
            });

            mockFlow.Traffic = new Traffic
            {
                Type = "simpleTraffic",
                Allocation = 100,
                Splits = new List<Split>
                {
                    new Split { Ref = "", SplitPercentage = 50 },
                    new Split { Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184", SplitPercentage = 25 },
                    new Split { Ref = "d075d8c5-e673-41f1-89ec-378729dfd601", SplitPercentage = 25 }
                },
                Coupled = false
            };

            mockFlow.Status = status;

            string serializedData = JsonConvert.SerializeObject(new List<MockFlowDefinitions>
            {
                mockFlow
            }, Formatting.Indented);

            return serializedData;
        }
        // Default variant(50%) variant B(50%)
        public static string CreateAndFillSimpleMockFlowDefinitionsJson(string friendlyId, string experimentName, string siteId, string status)
        {
            MockFlowDefinitions mockFlow = new MockFlowDefinitions
            {
                FriendlyId = friendlyId,
                Name = experimentName,
                SiteId = siteId
            };

            mockFlow.Variants.Add(new Variant
            {
                Name = "Rich Text (control)",
                IsControl = true,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_default\"}"
                        }
                    }
                }
            });

            mockFlow.Variants.Add(new Variant
            {
                Name = "Variant B",
                Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184",
                IsControl = false,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_95a33bdd56b54dc4a9d882c979f1a184\"}"
                        }
                    }
                }
            });

            mockFlow.Traffic = new Traffic
            {
                Type = "simpleTraffic",
                Allocation = 100,
                Splits = new List<Split>
                {
                    new Split { Ref = "", SplitPercentage = 50 },
                    new Split { Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184", SplitPercentage = 50 }
                },
                Coupled = false
            };

            mockFlow.Status = status;

            string serializedData = JsonConvert.SerializeObject(new List<MockFlowDefinitions>
            {
                mockFlow
            }, Formatting.Indented);

            return serializedData;
        }

        // Default variant(50%) variant B(25%)
        public static string CreateAndFillSimpleMockFlowDefinitionsWithWrongTrafficAllocationJson(string friendlyId, string experimentName, string siteId, string status)
        {
            MockFlowDefinitions mockFlow = new MockFlowDefinitions
            {
                FriendlyId = friendlyId,
                Name = experimentName,
                SiteId = siteId
            };

            mockFlow.Variants.Add(new Variant
            {
                Name = "Rich Text (control)",
                IsControl = true,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_default\"}"
                        }
                    }
                }
            });

            mockFlow.Variants.Add(new Variant
            {
                Name = "Variant B",
                Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184",
                IsControl = false,
                Tasks = new List<DataModelTask>
                {
                    new DataModelTask
                    {
                        Input = new TaskInput
                        {
                            Template = "{\"variantId\":\"087fa7497a8b4f1eaf4509af15bd9c97_95a33bdd56b54dc4a9d882c979f1a184\"}"
                        }
                    }
                }
            });

            mockFlow.Traffic = new Traffic
            {
                Type = "simpleTraffic",
                Allocation = 100,
                Splits = new List<Split>
                {
                    new Split { Ref = "", SplitPercentage = 50 },
                    new Split { Ref = "95a33bdd-56b5-4dc4-a9d8-82c979f1a184", SplitPercentage = 25 }
                },
                Coupled = false
            };

            mockFlow.Status = status;

            string serializedData = JsonConvert.SerializeObject(new List<MockFlowDefinitions>
            {
                mockFlow
            }, Formatting.Indented);

            return serializedData;
        }
    }
}
