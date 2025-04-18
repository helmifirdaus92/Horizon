// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using FluentAssertions;
using Sitecore.Common;
using Sitecore.Extensions.XElementExtensions;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Presentation.Models.Personalization;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Layouts;
using Sitecore.Mvc.Extensions;
using Sitecore.Rules;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Presentation.Mapper
{
    public class PresentationDetailsMapperTests
    {
        [Theory, AutoNData]
        internal void MapPresentationDetail_LayoutDefinitionShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Should().BeOfType<LayoutDefinition>();
            result.Devices.Should().HaveCountGreaterThan(1);
        }

        [Theory, AutoNData]
        internal void MapPresentationDetails_DeviceDefinitionShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            var deviceDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject;
            deviceDefinition.Renderings.Should().HaveCountGreaterThan(1);
            deviceDefinition.Placeholders.Should().HaveCountGreaterThan(1);
            deviceDefinition.ID.Should().Be(presentationDetails.Devices[0].Id.ToGuidString());
            deviceDefinition.Layout.Should().Be(presentationDetails.Devices[0].LayoutId.ToGuidString());
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_PlaceholderDefinitionShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            (result.Devices[0] as DeviceDefinition).Placeholders.Should().HaveCountGreaterThan(1);

            var placeholderDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Placeholders[0]
                .Should().BeOfType<PlaceholderDefinition>().Subject;
            placeholderDefinition.Key.Should().Be(presentationDetails.Devices[0].Placeholders[0].Key);
            placeholderDefinition.UniqueId.Should().Be(presentationDetails.Devices[0].Placeholders[0].InstanceId.ToGuidString());
            placeholderDefinition.MetaDataItemId.Should().Be(presentationDetails.Devices[0].Placeholders[0].MetadataId.ToGuidString());
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_RenderingDefinitionBasicPropertiesShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            (result.Devices[0] as DeviceDefinition).Renderings.Should().HaveCountGreaterThan(1);

            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[0]
                .Should().BeOfType<RenderingDefinition>().Subject;

            renderingDefinition.ItemID.Should().Be(presentationDetails.Devices[0].Renderings[0].Id.ToGuidString());
            renderingDefinition.UniqueId.Should().Be(presentationDetails.Devices[0].Renderings[0].InstanceId.ToGuidString());
            renderingDefinition.Placeholder.Should().Be(presentationDetails.Devices[0].Renderings[0].PlaceholderKey);
            renderingDefinition.Datasource.Should().Be(presentationDetails.Devices[0].Renderings[0].DataSource);
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_RenderingDefinitionParametersShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[0]
                .Should().BeOfType<RenderingDefinition>().Subject;
            renderingDefinition.Parameters.Should().Be(presentationDetails.Devices[0].Renderings[0].Parameters.ToQueryString());
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_RenderingDefinitionParametersShouldBeEncoded(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);
            var paramValue = "v1=foo&v2=foo bar";
            presentationDetails.Devices[0].Renderings[0].Parameters = new Dictionary<string, string>()
            {
                ["param1"] = paramValue
            };

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[0]
                .Should().BeOfType<RenderingDefinition>().Subject;
            renderingDefinition.Parameters.Should().Be($"param1={Uri.EscapeDataString(paramValue)}");
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_RenderingDefinitionEmptyAndNullParametersShouldBeNotBeIgnored(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            presentationDetails.Devices[0].Renderings[0].Parameters = new Dictionary<string, string>()
            {
                {
                    "key1", null
                },
                {
                    "key2", string.Empty
                },
                {
                    "key3", "{20FC7250-896C-445A-AE7E-4EADE373ABA3}|{F6DC722E-15DB-4826-920B-ACCFDA772432}|{1864351A-0EDC-4650-95C0-7AB675D646AF}"
                }
            };

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[0]
                .Should().BeOfType<RenderingDefinition>().Subject;
            renderingDefinition.Parameters.Should().Be($"key1&key2&key3={Uri.EscapeDataString("{20FC7250-896C-445A-AE7E-4EADE373ABA3}|{F6DC722E-15DB-4826-920B-ACCFDA772432}|{1864351A-0EDC-4650-95C0-7AB675D646AF}")}");
        }

        [Theory, AutoNData]
        internal void MapPresentationDetails_RenderingDefinitionCachingShouldBeMapped(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            (result.Devices[0] as DeviceDefinition).Renderings.Should().HaveCountGreaterThan(1);

            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[0]
                .Should().BeOfType<RenderingDefinition>().Subject;

            renderingDefinition.Cachable.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.Cacheable?.ToBoolString());
            renderingDefinition.VaryByData.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.VaryByData?.ToBoolString());
            renderingDefinition.VaryByDevice.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.VaryByParameters?.ToBoolString());
            renderingDefinition.VaryByLogin.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.VaryByLogin?.ToBoolString());
            renderingDefinition.VaryByParameters.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.VaryByParameters?.ToBoolString());
            renderingDefinition.VaryByUser.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.VaryByUser?.ToBoolString());
            renderingDefinition.ClearOnIndexUpdate.Should().Be(presentationDetails.Devices[0].Renderings[0].Caching.ClearOnIndexUpdate?.ToBoolString());
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_RenderingDefinitionPersonalizationShouldBeMapped(
            PresentationDetailsMapper sut,
            PresentationDetails presentationDetails,
            Guid ruleUniqueId,
            string ruleName,
            Guid actionId,
            Guid actionUniqueId,
            Guid dataSource,
            Guid renderingItem,
            string customParam)
        {
            // arrange
            var expectedConditions = "<conditions><condition uid=\"C94872848566480C819CBE7342459A98\" id=\"{4888ABBB-F17D-4485-B14B-842413F88732}\" /></conditions>";
            var rules = new RuleSetModel
            {
                Rules = new List<RuleModel>
                {
                    new RuleModel()
                    {
                        UniqueId = ruleUniqueId.ToString(),
                        Name = ruleName,
                        Conditions = expectedConditions,
                        Parameters = new Dictionary<string, string>()
                        {
                            {
                                "customRuleParam", customParam
                            }
                        },
                        RuleActions = new[]
                        {
                            new RuleActionModel()
                            {
                                Id = actionId.ToString(),
                                UniqueId = actionUniqueId.ToString(),
                                DataSource = dataSource.ToString(),
                                RenderingItem = renderingItem.ToString(),
                                Parameters = new Dictionary<string, string>()
                                {
                                    {
                                        "customActionParam", customParam
                                    }
                                },
                            }
                        }
                    }
                }
            };

            foreach (var device in presentationDetails.Devices)
            {
                foreach (var rendering in device.Renderings)
                {
                    rendering.Personalization.RuleSet = rules;
                }
            }

            // act
            var result = sut.MapPresentationDetails(presentationDetails);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            (result.Devices[0] as DeviceDefinition).Renderings.Should().HaveCountGreaterThan(1);

            var renderingDefinition = result.Devices[0].Should().BeOfType<DeviceDefinition>().Subject.Renderings[1]
                .Should().BeOfType<RenderingDefinition>().Subject;

            var rulesDefinition = new RulesDefinition(renderingDefinition.Rules.ToString());

            renderingDefinition.Conditions.Should().Be(presentationDetails.Devices[0].Renderings[1].Personalization.Conditions);
            renderingDefinition.MultiVariateTest.Should().Be(presentationDetails.Devices[0].Renderings[1].Personalization.MultiVariateTestId);
            renderingDefinition.PersonalizationTest.Should().Be(presentationDetails.Devices[0].Renderings[1].Personalization.PersonalizationTest);


            // assert rule
            var rule = rulesDefinition.GetRules().First();
            rule.GetAttributeValue(RulesDefinition.UidAttributeName).Should().Be(ruleUniqueId.ToGuidString());
            rule.GetAttributeValue("name").Should().Be(ruleName);
            rule.GetAttributeValue("customRuleParam").Should().Be(customParam);

            // assert action
            var action = rulesDefinition.GetRules().First().Descendants(RulesDefinition.ActionTagName).First();
            action.GetAttributeValue(RulesDefinition.UidAttributeName).Should().Be(actionUniqueId.ToString());
            action.GetAttributeValue(RulesDefinition.IdAttributeName).Should().Be(actionId.ToGuidString());
            action.GetAttributeValue("RenderingItem").Should().Be(renderingItem.ToString());
            action.GetAttributeValue("DataSource").Should().Be(dataSource.ToString());
            action.GetAttributeValue("customActionParam").Should().Be(customParam);

            // assert conditions
            var conditions = rule.Element(RulesDefinition.ConditionsTagName)?.ToString(SaveOptions.DisableFormatting);
            conditions.Should().Be(expectedConditions);
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_ShouldNotFailForEmptyPersonalization(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);
            presentationDetails.Devices.ForEach(d => d.Renderings.ForEach(r => r.Personalization = null));

            // act & assert
            sut.Invoking(s => s.MapPresentationDetails(presentationDetails)).Should().NotThrow();
        }

        [Theory, AutoNData]
        internal void MapPresentationDetail_ShouldNotFailForEmptyCaching(PresentationDetailsMapper sut, PresentationDetails presentationDetails)
        {
            // arrange
            WhenPersonalizationRulesAreEmpty(presentationDetails);
            presentationDetails.Devices.ForEach(d => d.Renderings.ForEach(r => r.Caching = null));

            // act & assert
            sut.Invoking(s => s.MapPresentationDetails(presentationDetails)).Should().NotThrow();
        }

        private static void WhenPersonalizationRulesAreEmpty(PresentationDetails presentationDetails)
        {
            foreach (var device in presentationDetails.Devices)
            {
                foreach (var rendering in device.Renderings)
                {
                    rendering.Personalization.RuleSet = null;
                }
            }
        }
    }
}
