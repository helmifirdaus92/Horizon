// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Threading;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.Horizon.Integration.Pipelines.BuildHorizonPageExtenders;
using Sitecore.Horizon.Integration.Pipelines.BuildItemPublishingTimeline;
using Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources;
using Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Pipelines.PopulateRawTimelineMetadata;
using Sitecore.Horizon.Integration.Pipelines.ResolveHorizonMode;

namespace Sitecore.Horizon.Integration.Pipelines
{
    // Use intermediate record and lazy to break circular dependency issue.
    // Some of the pipelines require IHorizonPipelines, so we have following:
    // pipelineA -> processorA -> IHorizonPipelines -> HorizonPipelines -> pipelineA
    //
    // To break that we introduce intermediate lazy.
    internal record HorizonPipelineDefinitions(
        HorizonSaveItemPipeline SaveItemPipeline,
        ResolveHorizonModePipeline ResolveHorizonModePipeline,
        BuildHorizonPageExtendersPipeline BuildHorizonPageExtendersPipeline,
        GetItemLayoutDataSourcesPipeline GetItemLayoutDataSourcesPipeline,
        HorizonMoveItemPipeline HorizonMoveItemPipeline,
        PopulateRawTimelineMetadataPipeline PopulateRawTimelineMetadataPipeline,
        BuildItemPublishingPipeline BuildItemPublishingPipeline
    );

    internal class HorizonPipelines : IHorizonPipelines
    {
        private readonly Lazy<HorizonPipelineDefinitions> _pipelineDefinitionsLazy;

        public HorizonPipelines(IServiceProvider serviceProvider)
        {
            _pipelineDefinitionsLazy = new Lazy<HorizonPipelineDefinitions>(() => serviceProvider.GetRequiredService<HorizonPipelineDefinitions>(), LazyThreadSafetyMode.ExecutionAndPublication);
        }

        private HorizonPipelineDefinitions Def => _pipelineDefinitionsLazy.Value;

        public void SaveItem(ref HorizonSaveItemArgs args) => RunPipeline(Def.SaveItemPipeline, ref args);

        public void ResolveHorizonMode(ref ResolveHorizonModeArgs args) => RunPipeline(Def.ResolveHorizonModePipeline, ref args);

        public void BuildHorizonPageExtenders(ref BuildHorizonPageExtendersArgs args) => RunPipeline(Def.BuildHorizonPageExtendersPipeline, ref args);

        public void GetItemLayoutDataSources(ref GetItemLayoutDataSourcesArgs args) => RunPipeline(Def.GetItemLayoutDataSourcesPipeline, ref args);

        public void HorizonMoveItem(ref HorizonMoveItemArgs args) => RunPipeline(Def.HorizonMoveItemPipeline, ref args);

        public void PopulateRawTimelineMetadata(ref PopulateRawTimelineMetadataArgs args) => RunPipeline(Def.PopulateRawTimelineMetadataPipeline, ref args);

        public void BuildItemPublishingTimeline(ref BuildItemPublishingTimelineArgs args) => RunPipeline(Def.BuildItemPublishingPipeline, ref args);

        private static void RunPipeline<T>(IHorizonPipeline<T> pipeline, ref T args) where T : struct, IHorizonPipelineArgs
        {
            foreach (var processor in pipeline.Processors)
            {
                if (args.Aborted)
                {
                    return;
                }

                processor.Process(ref args);
            }
        }
    }
}
