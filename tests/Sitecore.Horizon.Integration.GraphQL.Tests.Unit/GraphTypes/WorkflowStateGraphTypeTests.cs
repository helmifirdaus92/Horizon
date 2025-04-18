// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Workflows;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class WorkflowStateGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(WorkflowStateGraphType sut,
            ItemWorkflowInfo itemWorkflowInfo,
            List<WorkflowCommand> commands,
            List<WorkflowError> warnings)
        {
            // arrange
            itemWorkflowInfo.Commands.AddRange(commands);
            itemWorkflowInfo.Warnings.AddRange(warnings);

            // act & assert
            sut.Should().ResolveFieldValueTo("id", itemWorkflowInfo.State.StateID, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("displayName", itemWorkflowInfo.State.DisplayName, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("finalState", itemWorkflowInfo.State.FinalState, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("icon", itemWorkflowInfo.State.Icon, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("canEdit", itemWorkflowInfo.CanEdit, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("warnings", itemWorkflowInfo.Warnings, c => c.WithSource(itemWorkflowInfo));
            sut.Should().ResolveFieldValueTo("commands", itemWorkflowInfo.Commands, c => c.WithSource(itemWorkflowInfo));
        }
    }
}
