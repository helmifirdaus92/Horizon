// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal class ApplyRestrictions : IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>
    {
        private readonly IPublishingTimelineProvider _timelineProvider;

        public ApplyRestrictions(IPublishingTimelineProvider timelineProvider)
        {
            _timelineProvider = timelineProvider;
        }

        public void Process(ref BuildItemPublishingTimelineArgs args)
        {
            Assert.ArgumentNotNull(args.ItemPublishingRanges, nameof(args.ItemPublishingRanges));
            Assert.ArgumentNotNull(args.TimelineRestrictions, nameof(args.TimelineRestrictions));

            var filteredRanges = args.TimelineRestrictions!
                .Aggregate(args.ItemPublishingRanges, (current, restriction) => _timelineProvider.ApplyTimelineRestriction(current!, restriction));

            args.ItemPublishingRanges = filteredRanges;
        }
    }
}
