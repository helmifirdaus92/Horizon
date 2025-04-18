// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes.Personalization
{
    public class RuleInfoGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveProperties(RuleInfoGraphType sut, PersonalizationRuleInfo ruleInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("defaultRuleName", ruleInfo.DefaultRuleName, c => c.WithSource(ruleInfo));
            sut.Should().ResolveFieldValueTo("defaultRuleUniqueId", ruleInfo.DefaultRuleUniqueId, c => c.WithSource(ruleInfo));
            sut.Should().ResolveFieldValueTo("conditions", ruleInfo.Conditions, c => c.WithSource(ruleInfo));
            sut.Should().ResolveFieldValueTo("actions", ruleInfo.Actions, c => c.WithSource(ruleInfo));
        }
    }
}
