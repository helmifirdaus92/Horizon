// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using Sitecore.Diagnostics;
using Sitecore.Extensions.XElementExtensions;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Presentation.Models.Personalization;
using Sitecore.Layouts;
using Sitecore.Mvc.Extensions;
using Sitecore.Rules;
using Sitecore.Web;

namespace Sitecore.Horizon.Integration.Presentation.Mapper
{
    internal class LayoutDefinitionMapper : ILayoutDefinitionMapper
    {
        public PresentationDetails MapLayoutDefinition(LayoutDefinition layoutDefinition)
        {
            Assert.ArgumentNotNull(layoutDefinition, nameof(layoutDefinition));

            var deviceList = new List<DeviceModel>();

            foreach (DeviceDefinition deviceLayoutDefinition in layoutDefinition.Devices)
            {
                deviceList.Add(new DeviceModel
                {
                    Id = ParseGuid(deviceLayoutDefinition.ID),
                    LayoutId = ParseGuid(deviceLayoutDefinition.Layout),
                    Placeholders = GetPlaceholders(deviceLayoutDefinition),
                    Renderings = GetRenderings(deviceLayoutDefinition),
                });
            }

            return new PresentationDetails()
            {
                Devices = deviceList.ToArray(),
            };
        }

        private static PlaceholderModel[] GetPlaceholders(DeviceDefinition deviceLayoutDefinitions)
        {
            var placeholders = new List<PlaceholderModel>();

            foreach (PlaceholderDefinition placeholderDefinition in deviceLayoutDefinitions.Placeholders)
            {
                placeholders.Add(new PlaceholderModel
                {
                    InstanceId = ParseGuid(placeholderDefinition.UniqueId),
                    Key = placeholderDefinition.Key,
                    MetadataId = ParseGuid(placeholderDefinition.MetaDataItemId),
                });
            }

            return placeholders.ToArray();
        }

        private static RenderingModel[] GetRenderings(DeviceDefinition deviceLayoutDefinitions)
        {
            var renderings = new List<RenderingModel>();

            foreach (RenderingDefinition renderingDefinition in deviceLayoutDefinitions.Renderings)
            {
                renderings.Add(new RenderingModel
                {
                    InstanceId = ParseGuid(renderingDefinition.UniqueId),
                    PlaceholderKey = renderingDefinition.Placeholder,
                    Id = ParseGuid(renderingDefinition.ItemID),
                    DataSource = ValueOrNull(renderingDefinition.Datasource),
                    Caching = NonEmptyObjectOrNull(Caching(renderingDefinition)),
                    Personalization = NonEmptyObjectOrNull(Personalization(renderingDefinition)),
                    Parameters = ToParameter(renderingDefinition.Parameters),
                });
            }

            return renderings.ToArray();
        }

        private static PersonalizationModel Personalization(RenderingDefinition renderingDefinition)
        {
            return new PersonalizationModel(
                RuleSet(renderingDefinition),
                renderingDefinition.Conditions,
                renderingDefinition.MultiVariateTest,
                renderingDefinition.PersonalizationTest);
        }

        private static CachingModel Caching(RenderingDefinition renderingDefinition)
        {
            return new CachingModel
            {
                Cacheable = OptionalBool(renderingDefinition.Cachable),
                VaryByData = OptionalBool(renderingDefinition.VaryByData),
                ClearOnIndexUpdate = OptionalBool(renderingDefinition.ClearOnIndexUpdate),
                VaryByDevice = OptionalBool(renderingDefinition.VaryByDevice),
                VaryByLogin = OptionalBool(renderingDefinition.VaryByLogin),
                VaryByParameters = OptionalBool(renderingDefinition.VaryByParameters),
                VaryByQueryString = OptionalBool(renderingDefinition.VaryByQueryString),
                VaryByUser = OptionalBool(renderingDefinition.VaryByUser)
            };
        }

        private static RuleSetModel? RuleSet(RenderingDefinition renderingDefinition)
        {
            if (renderingDefinition.Rules == null)
            {
                return null;
            }

            return new RuleSetModel
            {
                Pet = BoolAttributeOrNull(renderingDefinition.Rules, "pet"),
                Rules = GetRules(new RulesDefinition(renderingDefinition.Rules.ToString())),
                Parameters = NonEmptyEnumerableOrNull(GetAllUnknownAttributes(renderingDefinition.Rules, new[]
                {
                    "pet"
                }))
            };
        }

        private static List<RuleModel> GetRules(RulesDefinition rulesDefinitions)
        {
            var ruleModels = new List<RuleModel>();
            var index = 0;

            var splitRules = RulesDefinition.SplitRules(rulesDefinitions.ToString(SaveOptions.DisableFormatting));

            foreach (RulesDefinition rulesDefinition in splitRules)
            {
                var rule = rulesDefinition.GetRules().First();
                Guid ruleId = rulesDefinition.GetRuleId(rule);

                ruleModels.Add(new RuleModel
                {
                    UniqueId = ruleId.ToGuidString(),
                    Name = RulesDefinition.GetRuleTitle(rule, index++),
                    Conditions = ValueOrNull(rule.Element(RulesDefinition.ConditionsTagName)?.ToString(SaveOptions.DisableFormatting)),
                    RuleActions = NonEmptyEnumerableOrNull(GetRuleActions(rule)),
                    Parameters = NonEmptyEnumerableOrNull(GetAllUnknownAttributes(rule, new[]
                    {
                        "name",
                        RulesDefinition.IdAttributeName,
                        RulesDefinition.UidAttributeName,
                    }))
                });
            }

            return ruleModels;
        }

        private static RuleActionModel[]? GetRuleActions(XElement rule)
        {
            var actions = rule?.Descendants(RulesDefinition.ActionTagName);

            return actions?.Select(action => new RuleActionModel
            {
                UniqueId = action.GetAttributeValue(RulesDefinition.UidAttributeName),
                Id = action.GetAttributeValue(RulesDefinition.IdAttributeName),
                RenderingItem = ValueOrNull(action.GetAttributeValue("RenderingItem")),
                DataSource = ValueOrNull(action.GetAttributeValue("DataSource")),
                RenderingParameters = NonEmptyEnumerableOrNull(ToParameter(action.GetAttributeValue("Parameters"))),
                Parameters = GetAllUnknownAttributes(action, new[]
                {
                    RulesDefinition.IdAttributeName,
                    RulesDefinition.UidAttributeName,
                    "DataSource",
                    "RenderingItem",
                    "Parameters",
                })
            }).ToArray();
        }

        private static bool? BoolAttributeOrNull(XElement element, string name)
        {
            if (!string.IsNullOrEmpty(element.GetAttributeValue(name)))
            {
                return bool.Parse(element.GetAttributeValue(name));
            }

            return null;
        }

        private static Dictionary<string, string> GetAllUnknownAttributes(XElement element, IReadOnlyList<string> knownAttributes)
        {
            return element.Attributes()
                .Where(xAttribute => !knownAttributes.Contains(xAttribute.Name.LocalName))
                .ToDictionary(xAttribute => xAttribute.Name.LocalName, xAttribute => xAttribute.Value);
        }

        private static Dictionary<string, string> ToParameter(string parameter)
        {
            if (!string.IsNullOrEmpty(parameter))
            {
                // Preserve keys with empty and null values also
                var nvc = WebUtil.ParseUrlParameters(parameter);
                return nvc.AllKeys.ToDictionary(k => k, k => nvc[k]);
            }

            return new Dictionary<string, string>();
        }

        private static string? ValueOrNull(string? value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return null;
            }

            return value;
        }

        private static T? NonEmptyObjectOrNull<T>(T? inputObject) where T : class
        {
            if (inputObject == null)
            {
                return null;
            }

            bool hasAnyNonNullProperty = false;

            foreach (var property in typeof(T).GetProperties())
            {
                var value = property.GetValue(inputObject);
                hasAnyNonNullProperty = hasAnyNonNullProperty || value != null;
            }

            return hasAnyNonNullProperty ? inputObject : null;
        }

        private static T? NonEmptyEnumerableOrNull<T>(T? inputObject) where T : class, IEnumerable
        {
            if (inputObject == null)
            {
                return null;
            }

            var enumerator = inputObject.GetEnumerator();
            var hasAnyElement = enumerator.MoveNext();

            return hasAnyElement ? inputObject : null;
        }

        private static bool? OptionalBool(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return null;
            }

            return value.ToBool();
        }

        private static Guid ParseGuid(string value)
        {
            return Guid.TryParse(value, out var parsed) ? parsed : Guid.Empty;
        }
    }
}
