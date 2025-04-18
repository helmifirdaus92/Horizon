// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Jobs;
using Sitecore.Links;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonMoveItem
{
    internal class RepairLinks : IHorizonPipelineProcessor<HorizonMoveItemArgs>
    {
        private readonly ISitecoreContext _context;
        private readonly BaseJobManager _jobManager;

        public RepairLinks(ISitecoreContext context, BaseJobManager jobManager)
        {
            _context = context;
            _jobManager = jobManager;
        }

        /// <summary>
        /// This Pipeline processor logic is taken from platform uiDragItemTo pipeline DragItemTo RepairLinks method
        /// Platform file: Sitecore.Kernel/Shell/Framework/Pipelines/DragItemTo.cs
        /// </summary>
        public void Process(ref HorizonMoveItemArgs args)
        {
            Assert.ArgumentNotNull(args.ItemToMove, nameof(args.ItemToMove));
            Assert.ArgumentNotNull(args.TargetItem, nameof(args.TargetItem));

            var jobOptions = new DefaultJobOptions("LinkUpdater",
                "LinkUpdater",
                _context?.Site?.Name,
                new LinkUpdaterJob(args.ItemToMove),
                "Update")
            {
                ContextUser = _context?.User
            };

            _jobManager.Start(jobOptions);
        }
    }
}
