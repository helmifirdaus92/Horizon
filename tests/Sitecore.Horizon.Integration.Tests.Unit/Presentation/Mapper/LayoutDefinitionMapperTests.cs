// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using AutoFixture;
using FluentAssertions;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Layouts;
using Sitecore.Mvc.Extensions;
using Sitecore.Rules;
using Sitecore.Web;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Presentation.Mapper
{
    public class LayoutDefinitionMapperTests
    {
        [Theory, AutoNData]
        internal void MapLayoutDefinition_PresentationDetailShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition)
        {
            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            var devices = result.Should().BeOfType<PresentationDetails>().Subject.Devices;
            devices.Should().HaveCountGreaterThan(1);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_DeviceModelShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition)
        {
            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            var device = result.Devices[0].Should().BeOfType<DeviceModel>().Subject;
            device.Renderings.Should().HaveCountGreaterThan(1);
            device.Placeholders.Should().HaveCountGreaterThan(1);

            var deviceDefinition = layoutDefinition.Devices[0] as DeviceDefinition;
            device.Id.Should().Be(deviceDefinition.ID);
            device.LayoutId.Should().Be(deviceDefinition.Layout);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_PlaceholderModelShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition)
        {
            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            result.Devices[0].Placeholders.Should().HaveCountGreaterThan(1);

            var placeholderDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Placeholders[0] as PlaceholderDefinition;
            result.Devices[0].Placeholders[0].Key.Should().Be(placeholderDefinition.Key);
            result.Devices[0].Placeholders[0].MetadataId.Should().Be(placeholderDefinition.MetaDataItemId);
            result.Devices[0].Placeholders[0].InstanceId.Should().Be(placeholderDefinition.UniqueId);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelBasicPropertiesShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition, Guid itemId, Guid instanceId)
        {
            // arrange
            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[0] as RenderingDefinition;
            renderingDefinition.ItemID = itemId.ToString();
            renderingDefinition.UniqueId = instanceId.ToString();

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            result.Devices[0].Renderings.Should().HaveCountGreaterThan(1);

            result.Devices[0].Renderings[0].Id.Should().Be(itemId.ToString());
            result.Devices[0].Renderings[0].InstanceId.Should().Be(instanceId.ToString());
            result.Devices[0].Renderings[0].PlaceholderKey.Should().Be(renderingDefinition.Placeholder);
            result.Devices[0].Renderings[0].DataSource.Should().Be(renderingDefinition.Datasource);
            result.Devices[0].Renderings[0].Parameters.Should().HaveCountGreaterOrEqualTo(1);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelParametersShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition, Guid itemId, Guid instanceId)
        {
            // arrange
            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[0] as RenderingDefinition;
            renderingDefinition.ItemID = itemId.ToString();
            renderingDefinition.UniqueId = instanceId.ToString();
            renderingDefinition.Parameters = "GridParameters={20FC7250-896C-445A-AE7E-4EADE373ABA3}|{F6DC722E-15DB-4826-920B-ACCFDA772432}|{1864351A-0EDC-4650-95C0-7AB675D646AF}&FieldNames={DD325BD4-D5A7-4359-A69B-5CB49F5F2AE2}";

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices[0].Renderings[0].Parameters.Should().HaveCount(2);
            result.Devices[0].Renderings[0].Parameters.Should().ContainKeys("GridParameters", "FieldNames");
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelParametersEmptyParametersShouldNotBeIgnored(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition, Guid itemId, Guid instanceId)
        {
            // arrange
            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[0] as RenderingDefinition;
            renderingDefinition.ItemID = itemId.ToString();
            renderingDefinition.UniqueId = instanceId.ToString();
            renderingDefinition.Parameters = "RenderingIdentifier&GridParameters={20FC7250-896C-445A-AE7E-4EADE373ABA3}|{F6DC722E-15DB-4826-920B-ACCFDA772432}|{1864351A-0EDC-4650-95C0-7AB675D646AF}&FieldNames={DD325BD4-D5A7-4359-A69B-5CB49F5F2AE2}";

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices[0].Renderings[0].Parameters.Should().HaveCount(3);
            result.Devices[0].Renderings[0].Parameters.Should().ContainKey("RenderingIdentifier");
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelCachingShouldBeMapped(LayoutDefinitionMapper sut, LayoutDefinition layoutDefinition, Generator<bool> boolGen)
        {
            // arrange
            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[0] as RenderingDefinition;
            var cacheable = boolGen.First();
            renderingDefinition.Cachable = cacheable.ToString();
            var varyByData = boolGen.First();
            renderingDefinition.VaryByData = varyByData.ToString();
            var varyByDevice = boolGen.First();
            renderingDefinition.VaryByDevice = varyByDevice.ToString();
            var varyByLogin = boolGen.First();
            renderingDefinition.VaryByLogin = varyByLogin.ToString();
            var varyByParameters = boolGen.First();
            renderingDefinition.VaryByParameters = varyByParameters.ToString();
            var varyByQueryString = boolGen.First();
            renderingDefinition.VaryByQueryString = varyByQueryString.ToString();
            var varyByUser = boolGen.First();
            renderingDefinition.VaryByUser = varyByUser.ToString();
            var clearOnIndexUpdate = boolGen.First();
            renderingDefinition.ClearOnIndexUpdate = clearOnIndexUpdate.ToString();

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices.Should().HaveCountGreaterThan(1);
            result.Devices[0].Renderings.Should().HaveCountGreaterThan(1);

            result.Devices[0].Renderings[0].Caching.Cacheable.Should().Be(cacheable);
            result.Devices[0].Renderings[0].Caching.VaryByData.Should().Be(varyByData);
            result.Devices[0].Renderings[0].Caching.VaryByDevice.Should().Be(varyByDevice);
            result.Devices[0].Renderings[0].Caching.VaryByLogin.Should().Be(varyByLogin);
            result.Devices[0].Renderings[0].Caching.VaryByParameters.Should().Be(varyByParameters);
            result.Devices[0].Renderings[0].Caching.VaryByQueryString.Should().Be(varyByQueryString);
            result.Devices[0].Renderings[0].Caching.VaryByUser.Should().Be(varyByUser);
            result.Devices[0].Renderings[0].Caching.ClearOnIndexUpdate.Should().Be(clearOnIndexUpdate);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelPersonalizationShouldBeMapped(
            LayoutDefinitionMapper sut,
            LayoutDefinition layoutDefinition,
            Guid ruleId,
            string ruleName,
            Guid actionId,
            Guid conditionId,
            Guid uniqueId,
            Guid dataSource,
            Guid renderingItem,
            Dictionary<string, string> renderingParameters
        )
        {
            // arrange
            RulesDefinition rules = new RulesDefinition(string.Empty);
            var rawRenderingParameters = renderingParameters.ToQueryString();

            var rule = rules.AddRule(ruleId);
            rule.SetAttributeValue("name", ruleName);
            rule.SetAttributeValue("test", true);
            rule.SetAttributeValue("customParam", "custom");

            var action = rules.AddAction(ruleId, actionId);
            action.SetAttributeValue(RulesDefinition.UidAttributeName, uniqueId);
            action.SetAttributeValue("DataSource", dataSource);
            action.SetAttributeValue("RenderingItem", renderingItem);
            action.SetAttributeValue("customParam", "customActionProp");
            action.SetAttributeValue("Parameters", rawRenderingParameters);

            rules.AddCondition(ruleId, conditionId);

            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[1] as RenderingDefinition;
            renderingDefinition.Rules = XElement.Parse(rules.ToString());
            (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[1] = renderingDefinition;

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices[0].Renderings[1].Personalization.Conditions.Should().Be(renderingDefinition.Conditions);
            result.Devices[0].Renderings[1].Personalization.MultiVariateTestId.Should().Be(renderingDefinition.MultiVariateTest);
            result.Devices[0].Renderings[1].Personalization.PersonalizationTest.Should().Be(renderingDefinition.PersonalizationTest);

            // assert Rule
            var resultRule = result.Devices[0].Renderings[1].Personalization.RuleSet.Rules[0];
            resultRule.UniqueId.Should().Be(ruleId.ToGuidString());
            resultRule.Name.Should().Be(ruleName);
            resultRule.Parameters["customParam"].Should().Be("custom");

            // assert Rule Condition
            resultRule.Conditions.Should().Contain(conditionId.ToGuidString());

            // assert Rule action
            var resultAction = resultRule.RuleActions[0];
            resultAction.Id.Should().Be(actionId.ToGuidString());
            resultAction.UniqueId.Should().Be(uniqueId.ToString());
            resultAction.DataSource.Should().Be(dataSource.ToString());
            resultAction.RenderingItem.Should().Be(renderingItem.ToString());
            resultAction.Parameters["customParam"].Should().Be("customActionProp");
            resultAction.RenderingParameters.Should().BeEquivalentTo(renderingParameters);
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelEmptyPersonalizationShouldBeMappedToNull(
            LayoutDefinitionMapper sut,
            LayoutDefinition layoutDefinition
        )
        {
            // arrange
            ((layoutDefinition.Devices[0] as DeviceDefinition).Renderings[1] as RenderingDefinition).Rules = null;

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);


            // assert personalization
            result.Devices[0].Renderings[1].Personalization.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelEmptyCachingShouldBeMappedToNull(
            LayoutDefinitionMapper sut,
            LayoutDefinition layoutDefinition
        )
        {
            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);


            // assert personalization
            result.Devices[0].Renderings[1].Caching.Should().BeNull();
        }

        [Theory, AutoNData]
        internal void MapLayoutDefinition_RenderingModelPersonalizationEmptyValuesShoulBeMappedToNull(
            LayoutDefinitionMapper sut,
            LayoutDefinition layoutDefinition,
            Guid ruleId,
            string ruleName
        )
        {
            // arrange
            RulesDefinition rules = new RulesDefinition(string.Empty);
            var rule = rules.AddRule(ruleId);
            rule.SetAttributeValue("name", ruleName);

            var renderingDefinition = (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[1] as RenderingDefinition;
            renderingDefinition.Rules = XElement.Parse(rules.ToString());
            (layoutDefinition.Devices[0] as DeviceDefinition).Renderings[1] = renderingDefinition;

            // act
            var result = sut.MapLayoutDefinition(layoutDefinition);

            // assert
            result.Devices[0].Renderings[1].Personalization.Conditions.Should().BeNull();
            result.Devices[0].Renderings[1].Personalization.MultiVariateTestId.Should().BeNull();
            result.Devices[0].Renderings[1].Personalization.PersonalizationTest.Should().BeNull();

            var resultRule = result.Devices[0].Renderings[1].Personalization.RuleSet.Rules[0];
            resultRule.Conditions.Should().BeNull();
            resultRule.RuleActions.Should().BeNull();
            resultRule.Parameters.Should().BeNull();
        }
    }
}
