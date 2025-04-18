// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.


using System;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal class ProcessItemVersionOverlapping : IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>
    {
        private readonly IPublishingTimelineProvider _timelineProvider;

        public ProcessItemVersionOverlapping(IPublishingTimelineProvider timelineProvider)
        {
            _timelineProvider = timelineProvider;
        }

        public void Process(ref BuildItemPublishingTimelineArgs args)
        {
            //should be skipped when timeline retrieved from cache

            var rawPublishingRanges = args.ItemPublishingRanges ?? throw new InvalidOperationException(nameof(args.ItemPublishingRanges));

            if (rawPublishingRanges.Count > 1)
            {
                args.ItemPublishingRanges = _timelineProvider.HandleVersionRangesOverlapping(rawPublishingRanges);
            }
        }
    }
}
