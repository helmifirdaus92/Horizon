// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization
{
    internal record PersonalizationRuleInfo(string DefaultRuleName, string DefaultRuleUniqueId, PersonalizationConditionsInfo Conditions, PersonalizationActionsInfo Actions);

    internal class RuleInfoGraphType : ObjectGraphType<PersonalizationRuleInfo>
    {
        public RuleInfoGraphType()
        {
            Name = "PersonalizationRuleInfo";

            Field<NonNullGraphType<StringGraphType>>(
                "defaultRuleName",
                resolve: ctx => ctx.Source.DefaultRuleName);

            Field<NonNullGraphType<StringGraphType>>(
                "defaultRuleUniqueId",
                resolve: ctx => ctx.Source.DefaultRuleUniqueId);

            Field<NonNullGraphType<RuleConditionsInfoGraphType>>(
                "conditions",
                resolve: ctx => ctx.Source.Conditions);

            Field<NonNullGraphType<RuleActionsInfoGraphType>>(
                "actions",
                resolve: ctx => ctx.Source.Actions);
        }
    }
}
