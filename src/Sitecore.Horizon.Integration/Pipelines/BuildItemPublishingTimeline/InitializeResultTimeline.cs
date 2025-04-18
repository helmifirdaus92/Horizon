// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.Timeline;

namespace Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline
{
    internal class InitializeResultTimeline : IHorizonPipelineProcessor<BuildItemPublishingTimelineArgs>
    {
        public void Process(ref BuildItemPublishingTimelineArgs args)
        {
            Assert.ArgumentNotNull(args.ItemPublishingRanges, nameof(args.ItemPublishingRanges));

            if (args.ResultTimeline == null)
            {
                args.ResultTimeline = new ItemPublishingTimeline(args.Item.ID, args.ItemPublishingRanges!);
            }
        }
    }
}
