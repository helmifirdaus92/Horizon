// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Horizon.Integration.ExternalProxy;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal class HorizonMoveItemPipeline : IHorizonPipeline<HorizonMoveItemArgs>
    {
        public HorizonMoveItemPipeline(ISitecoreContext scContext, BaseJobManager jobManager)
        {
            Processors = new IHorizonPipelineProcessor<HorizonMoveItemArgs>[]
            {
                new CheckPermissions(),
                new MoveItemTo(),
                new RepairLinks(scContext, jobManager)
            };
        }

        public IHorizonPipelineProcessor<HorizonMoveItemArgs>[] Processors { get; }
    }
}
