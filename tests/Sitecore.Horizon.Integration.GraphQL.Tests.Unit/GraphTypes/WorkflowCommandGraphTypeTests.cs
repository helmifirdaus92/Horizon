// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Workflows;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class WorkflowCommandGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(WorkflowCommandGraphType sut, Guid commandId)
        {
            // arrange
            var workflowCommand = new WorkflowCommand(commandId.ToString(), "testDisplayName1", "testIcon1", true);

            // act & assert
            sut.Should().ResolveFieldValueTo("id", commandId, c => c.WithSource(workflowCommand));
            sut.Should().ResolveFieldValueTo("displayName", workflowCommand.DisplayName, c => c.WithSource(workflowCommand));
            sut.Should().ResolveFieldValueTo("icon", workflowCommand.Icon, c => c.WithSource(workflowCommand));
            sut.Should().ResolveFieldValueTo("suppressComment", workflowCommand.SuppressComment, c => c.WithSource(workflowCommand));
            sut.Should().ResolveFieldValueTo("hasUI", workflowCommand.HasUI, c => c.WithSource(workflowCommand));
        }
    }
}
