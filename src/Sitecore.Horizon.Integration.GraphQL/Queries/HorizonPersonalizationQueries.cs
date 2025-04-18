// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Rules;

namespace Sitecore.Horizon.Integration.GraphQL.Queries
{
    internal class HorizonPersonalizationQueries : ObjectGraphType
    {
        private const string UniqueIdPlaceholder = "ConditionUniqueIdPlaceholder";
        private const string VariantValuePlaceholder = "VariantValuePlaceholder";
        private const string RuleIdAttributeName = "id";
        private const string AudienceVisitorInVariantRuleId = "{8E7426A4-12ED-4C44-8625-E7191860E726}";
        private const string VariantAttributeName = "VariantName";
        private const string SetRenderingParametersActionId = "{525C7B5A-8FD2-4B99-89F6-4F3F6D23BB02}";


        public HorizonPersonalizationQueries()
        {
            Name = nameof(HorizonPersonalizationQueries);

            Field<NonNullGraphType<RuleInfoGraphType>>(
                "personalizationRuleInfo",
                resolve: ctx => BuildRuleInfo()
            );
        }

        private static PersonalizationRuleInfo BuildRuleInfo()
        {
            var alwaysTrueRuleId = RuleIds.TrueConditionId.ToString();
            var alwaysTrueConditionTemplate = $"<conditions><condition uid=\"{UniqueIdPlaceholder}\" {RuleIdAttributeName}=\"{alwaysTrueRuleId}\" /></conditions>";
            var audienceVisitorFilterConditionTemplate = $"<conditions><condition uid=\"{UniqueIdPlaceholder}\" {RuleIdAttributeName}=\"{AudienceVisitorInVariantRuleId}\" {VariantAttributeName}=\"{VariantValuePlaceholder}\" /></conditions>";

            var conditions = new PersonalizationConditionsInfo(alwaysTrueConditionTemplate, audienceVisitorFilterConditionTemplate, RuleIdAttributeName,
                alwaysTrueRuleId, AudienceVisitorInVariantRuleId, VariantAttributeName, UniqueIdPlaceholder, VariantValuePlaceholder);

            var actions = new PersonalizationActionsInfo(
                RuleIds.SetDatasourceActionId.ToString(),
                RuleIds.SetRenderingActionId.ToString(),
                RuleIds.HideRenderingActionId.ToString(),
                SetRenderingParametersActionId
                );

            var ruleInfo = new PersonalizationRuleInfo(Translate.Text(Texts.DEFAULT), ID.Null.ToString(), conditions, actions);

            return ruleInfo;
        }
    }
}
