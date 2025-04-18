// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

namespace Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata
{
    internal class PopulateRawTimelineMetadataPipeline : IHorizonPipeline<PopulateRawTimelineMetadataArgs>
    {
        public PopulateRawTimelineMetadataPipeline()
        {
            Processors = new IHorizonPipelineProcessor<PopulateRawTimelineMetadataArgs>[]
            {
                new IgnoreNeverPublishItem(),
                new RegisterItemRestrictions(),
                new PopulateItemVersions()
            };
        }

        public IHorizonPipelineProcessor<PopulateRawTimelineMetadataArgs>[] Processors { get; }
    }
}
