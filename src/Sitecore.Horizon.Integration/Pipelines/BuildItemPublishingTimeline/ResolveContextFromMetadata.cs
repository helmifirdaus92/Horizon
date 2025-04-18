// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal class ResolveContextFromMetadata : IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>
    {
        private readonly IHorizonPipelines _horizonPipelines;

        public ResolveContextFromMetadata(IHorizonPipelines horizonPipelines)
        {
            _horizonPipelines = horizonPipelines;
        }

        public virtual void Process(ref BuildItemPublishingTimelineArgs args)
        {
            if (args.ItemPublishingRanges != null && args.TimelineRestrictions != null)
            {
                return;
            }

            var rawMetadataArgs = PopulateRawTimelineMetadataArgs.Create(args.Item);

            _horizonPipelines.PopulateRawTimelineMetadata(ref rawMetadataArgs);

            args.ItemPublishingRanges = rawMetadataArgs.Metadata.RawItemPublishingRanges;
            args.TimelineRestrictions = rawMetadataArgs.Metadata.RawTimelineRestrictions;
        }
    }
}
