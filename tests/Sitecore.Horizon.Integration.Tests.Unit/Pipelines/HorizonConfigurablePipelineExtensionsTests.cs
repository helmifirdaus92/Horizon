// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using NSubstitute;
using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.CollectIFrameAllowedDomains;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Pipelines
{
    public class HorizonConfigurablePipelineExtensionsTests
    {
        [Theory, AutoNData]
        internal void CollectIFrameAllowedDomains_ShouldCallPipeline(
            BaseCorePipelineManager pipelineManager,
            CollectIFrameAllowedDomainsArgs args)
        {
            // act
            pipelineManager.Horizon().CollectIFrameAllowedDomains(args);

            // assert
            pipelineManager.Received().Run("collectIFrameAllowedDomains", args, HorizonConfigurablePipelines.PipelineGroupName);
        }
    }
}
