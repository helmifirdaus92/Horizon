// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;

namespace Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources
{
    internal class GetItemLayoutDataSourcesPipeline : IHorizonPipeline<GetItemLayoutDataSourcesArgs>
    {
        public GetItemLayoutDataSourcesPipeline(BaseCorePipelineManager pipelineManager)
        {
            Processors = new IHorizonPipelineProcessor<GetItemLayoutDataSourcesArgs>[]
            {
                new ResolveRenderings(),
                new CollectDataSources(pipelineManager)
            };
        }

        public IHorizonPipelineProcessor<GetItemLayoutDataSourcesArgs>[] Processors { get; }
    }
}
