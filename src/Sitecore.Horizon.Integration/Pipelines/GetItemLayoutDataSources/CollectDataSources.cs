// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Layouts;
using Sitecore.Pipelines.ParseDataSource;

namespace Sitecore.Horizon.Integration.Pipelines.GetItemLayoutDataSources
{
    internal class CollectDataSources : IHorizonPipelineProcessor<GetItemLayoutDataSourcesArgs>
    {
        private readonly BaseCorePipelineManager _pipelineManager;

        public CollectDataSources(BaseCorePipelineManager pipelineManager)
        {
            _pipelineManager = pipelineManager;
        }

        public void Process(ref GetItemLayoutDataSourcesArgs args)
        {
            Assert.ArgumentNotNull(args.Renderings, nameof(args.Renderings));

            foreach (RenderingReference rendering in args.Renderings!)
            {
                Item item = args.Item;
                string dataSource = rendering.Settings.DataSource;

                ICollection<Item> dataSourceItems = ParseRenderingDataSources(item, dataSource);

                foreach (Item dataSourceItem in dataSourceItems)
                {
                    args.DataSourceItems.Add(dataSourceItem);
                }
            }
        }

        protected virtual ICollection<Item> ParseRenderingDataSources(Item item, string? dataSource)
        {
            return ParseDataSourcePipeline.Run(_pipelineManager, item.Database, dataSource, item);
        }
    }
}
