// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Data;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Horizon.Integration.GraphQL.Queries;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Rules;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Queries
{
    public class HorizonPersonalizationQueriesTests
    {
        [Theory, AutoNData]
        internal void User_ShouldReturnContextUser(HorizonPersonalizationQueries sut)
        {
            // act
            var personalizationRuleInfo = sut.ResolveFieldValue<PersonalizationRuleInfo>("personalizationRuleInfo");

            // assert
            personalizationRuleInfo.DefaultRuleUniqueId.Should().Be(ID.Null.ToString());
            personalizationRuleInfo.DefaultRuleName.Should().Be(Translate.Text(Texts.DEFAULT));

            personalizationRuleInfo.Conditions.AudienceVisitorFilterConditionTemplate.Contains(personalizationRuleInfo.Conditions.UniqueIdPlaceholder).Should().BeTrue();
            personalizationRuleInfo.Conditions.AudienceVisitorFilterConditionTemplate.Contains(personalizationRuleInfo.Conditions.RuleIdAttributeName).Should().BeTrue();
            personalizationRuleInfo.Conditions.AudienceVisitorFilterConditionTemplate.Contains(personalizationRuleInfo.Conditions.AudienceVisitorInVariantRuleId).Should().BeTrue();
            personalizationRuleInfo.Conditions.AudienceVisitorFilterConditionTemplate.Contains(personalizationRuleInfo.Conditions.VariantAttributeName).Should().BeTrue();
            personalizationRuleInfo.Conditions.AudienceVisitorFilterConditionTemplate.Contains(personalizationRuleInfo.Conditions.VariantValuePlaceholder).Should().BeTrue();

            personalizationRuleInfo.Conditions.AlwaysTrueConditionTemplate.Contains(personalizationRuleInfo.Conditions.AlwaysTrueRuleId).Should().BeTrue();
            personalizationRuleInfo.Conditions.AlwaysTrueConditionTemplate.Contains(personalizationRuleInfo.Conditions.UniqueIdPlaceholder).Should().BeTrue();
            personalizationRuleInfo.Conditions.AlwaysTrueConditionTemplate.Contains(RuleIds.TrueConditionId.ToString()).Should().BeTrue();
            
            personalizationRuleInfo.Actions.HideRenderingActionId.Should().Be(RuleIds.HideRenderingActionId.ToString());
            personalizationRuleInfo.Actions.SetDatasourceActionId.Should().Be(RuleIds.SetDatasourceActionId.ToString());
            personalizationRuleInfo.Actions.SetRenderingActionId.Should().Be(RuleIds.SetRenderingActionId.ToString());
        }
    }
}
