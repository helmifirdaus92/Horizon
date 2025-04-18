// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal class BuildItemPublishingPipeline : IHorizonPipeline<BuildItemPublishingTimelineArgs>
    {
        public BuildItemPublishingPipeline(IPublishingTimelineProvider timelineProvider, IHorizonPipelines horizonPipelines)
        {
            Processors = new IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>[]
            {
                new ResolveContextFromMetadata(horizonPipelines),
                new ProcessItemVersionOverlapping(timelineProvider),
                new ApplyRestrictions(timelineProvider),
                new InitializeResultTimeline()
            };
        }

        public IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>[] Processors { get; }
    }
}
