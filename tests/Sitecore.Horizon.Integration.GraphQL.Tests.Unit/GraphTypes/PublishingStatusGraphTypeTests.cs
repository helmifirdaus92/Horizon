// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Jobs;
using Sitecore.Publishing;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PublishingStatusGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveProcessedItemsCountField(PublishingStatusGraphType sut, PublishStatus publishStatus)
        {
            // arrange
            var processedCount = 5;
            publishStatus.SetProcessed(processedCount);

            // act & assert
            sut.Should().ResolveFieldValueTo("processedItemsCount", processedCount, c => c.WithSource(publishStatus));
        }

        [Theory]
        [InlineAutoNData(JobState.Initializing, PublishingState.Running)]
        [InlineAutoNData(JobState.Queued, PublishingState.Running)]
        [InlineAutoNData(JobState.Running, PublishingState.Running)]
        [InlineAutoNData(JobState.Finished, PublishingState.Completed)]
        [InlineAutoNData(JobState.AbortRequested, PublishingState.Failed)]
        [InlineAutoNData(JobState.Aborted, PublishingState.Failed)]
        [InlineAutoNData(JobState.Unknown, PublishingState.NotFound)]
        internal void ShouldResolveStateCodeField(JobState jobState, PublishingState publishingState, PublishingStatusGraphType sut, PublishStatus publishStatus)
        {
            // arrange
            publishStatus.SetState(jobState);

            // act & assert
            sut.Should().ResolveFieldValueTo("stateCode", publishingState, c => c.WithSource(publishStatus));
        }
        
        
        [Theory, AutoNData]
        internal void ShouldResolveStateCodeFieldToFailed_WhenPublishStatusIsFailed(PublishingStatusGraphType sut, PublishStatus publishStatus)
        {
            // arrange
            publishStatus.SetState(JobState.Unknown);
            publishStatus.SetFailed(true);

            // act & assert
            sut.Should().ResolveFieldValueTo("stateCode", PublishingState.Failed, c => c.WithSource(publishStatus));
        }

    }
}
