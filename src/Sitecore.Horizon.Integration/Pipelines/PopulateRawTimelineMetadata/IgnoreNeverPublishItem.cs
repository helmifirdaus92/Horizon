// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata
{
    internal class IgnoreNeverPublishItem : IHorizonPipelineProcessor<PopulateRawTimelineMetadataArgs>
    {
        public void Process(ref PopulateRawTimelineMetadataArgs args)
        {
            if (args.Item.Publishing.NeverPublish)
            {
                args.Aborted = true;
            }
        }
    }
}
