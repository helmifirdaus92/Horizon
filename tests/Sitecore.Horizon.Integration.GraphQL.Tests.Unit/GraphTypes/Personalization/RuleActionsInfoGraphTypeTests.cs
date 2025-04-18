// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes.Personalization;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes.Personalization
{
    public class RuleActionsInfoGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveProperties(RuleActionsInfoGraphType sut, PersonalizationActionsInfo actionsInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("setDatasourceActionId", actionsInfo.SetDatasourceActionId, c => c.WithSource(actionsInfo));
            sut.Should().ResolveFieldValueTo("setRenderingActionId", actionsInfo.SetRenderingActionId, c => c.WithSource(actionsInfo));
            sut.Should().ResolveFieldValueTo("hideRenderingActionId", actionsInfo.HideRenderingActionId, c => c.WithSource(actionsInfo));
        }
    }
}
