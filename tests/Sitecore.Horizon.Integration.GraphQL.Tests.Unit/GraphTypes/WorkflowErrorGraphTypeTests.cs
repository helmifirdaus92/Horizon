// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items.Workflow;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class WorkflowErrorGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(WorkflowErrorGraphType sut, ID itemId, string errorMessage)
        {
            // arrange
            WorkflowError workflowError = new(itemId, WorkflowErrorCode.ItemLockedByAnotherUser, errorMessage);

            // act & assert
            sut.Should().ResolveFieldValueTo("errorCode", workflowError.ErrorCode.ToString(), c => c.WithSource(workflowError));
            sut.Should().ResolveFieldValueTo("message", workflowError.Message, c => c.WithSource(workflowError));
            sut.Should().ResolveFieldValueTo("id", workflowError.ItemId, c => c.WithSource(workflowError));
        }
    }
}
