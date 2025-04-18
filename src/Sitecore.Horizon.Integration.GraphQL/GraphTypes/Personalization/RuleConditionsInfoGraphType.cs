// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization
{
    internal record PersonalizationConditionsInfo(string AlwaysTrueConditionTemplate, string AudienceVisitorFilterConditionTemplate, string RuleIdAttributeName,
        string AlwaysTrueRuleId, string AudienceVisitorInVariantRuleId, string VariantAttributeName, string UniqueIdPlaceholder, string VariantValuePlaceholder);

    internal class RuleConditionsInfoGraphType : ObjectGraphType<PersonalizationConditionsInfo>
    {
        public RuleConditionsInfoGraphType()
        {
            Name = "RuleConditionsInfo";

            Field<NonNullGraphType<StringGraphType>>(
                "alwaysTrueConditionTemplate",
                resolve: ctx => ctx.Source.AlwaysTrueConditionTemplate);

            Field<NonNullGraphType<StringGraphType>>(
                "audienceVisitorFilterConditionTemplate",
                resolve: ctx => ctx.Source.AudienceVisitorFilterConditionTemplate);

            Field<NonNullGraphType<StringGraphType>>(
                "ruleIdAttributeName",
                resolve: ctx => ctx.Source.RuleIdAttributeName);

            Field<NonNullGraphType<StringGraphType>>(
                "alwaysTrueRuleId",
                resolve: ctx => ctx.Source.AlwaysTrueRuleId);

            Field<NonNullGraphType<StringGraphType>>(
                "audienceVisitorInVariantRuleId",
                resolve: ctx => ctx.Source.AudienceVisitorInVariantRuleId);

            Field<NonNullGraphType<StringGraphType>>(
                "variantAttributeName",
                resolve: ctx => ctx.Source.VariantAttributeName);

            Field<NonNullGraphType<StringGraphType>>(
                "uniqueIdPlaceholder",
                resolve: ctx => ctx.Source.UniqueIdPlaceholder);

            Field<NonNullGraphType<StringGraphType>>(
                "variantValuePlaceholder",
                resolve: ctx => ctx.Source.VariantValuePlaceholder);
        }
    }
}
