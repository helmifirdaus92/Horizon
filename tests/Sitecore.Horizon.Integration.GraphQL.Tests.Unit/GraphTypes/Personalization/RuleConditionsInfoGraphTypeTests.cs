// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes.Personalization
{
    public class RuleConditionsInfoGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveProperties(RuleConditionsInfoGraphType sut, PersonalizationConditionsInfo conditionsInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("alwaysTrueConditionTemplate", conditionsInfo.AlwaysTrueConditionTemplate, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("audienceVisitorFilterConditionTemplate", conditionsInfo.AudienceVisitorFilterConditionTemplate, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("ruleIdAttributeName", conditionsInfo.RuleIdAttributeName, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("alwaysTrueRuleId", conditionsInfo.AlwaysTrueRuleId, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("audienceVisitorInVariantRuleId", conditionsInfo.AudienceVisitorInVariantRuleId, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("variantAttributeName", conditionsInfo.VariantAttributeName, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("uniqueIdPlaceholder", conditionsInfo.UniqueIdPlaceholder, c => c.WithSource(conditionsInfo));
            sut.Should().ResolveFieldValueTo("variantValuePlaceholder", conditionsInfo.VariantValuePlaceholder, c => c.WithSource(conditionsInfo));
        }
    }
}
