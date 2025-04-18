// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Checks whether items to be saved are locked and if they are it aborts the pipeline.
    /// </summary>
    internal class CheckItemLock : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public CheckItemLock(ISitecoreContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            if (_context.User.IsAdministrator)
            {
                return;
            }

            if (args.Items.Count == 0)
            {
                return;
            }

            for (int i = args.Items.Count - 1; i >= 0; i--)
            {
                HorizonArgsSaveItem saveItem = args.Items[i];
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item == null)
                {
                    continue;
                }

                if (item.Locking.IsLocked() && !item.Locking.HasLock())
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemLockedByAnotherUser));
                    return;
                }
            }
        }
    }
}
