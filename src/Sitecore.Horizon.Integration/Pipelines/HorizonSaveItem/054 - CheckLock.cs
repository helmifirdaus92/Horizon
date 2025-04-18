// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Checks locking.
    /// </summary>
    internal class CheckLock : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;
        private readonly BaseTemplateManager _templateManager;

        public CheckLock(ISitecoreContext context, BaseTemplateManager templateManager)
        {
            _context = context;
            _templateManager = templateManager;
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item == null)
                {
                    continue;
                }

                if (!_templateManager.IsFieldPartOfTemplate(FieldIDs.Lock, item))
                {
                    continue;
                }

                if (_context.User.IsAdministrator || item.Locking.HasLock())
                {
                    continue;
                }

                if (item.Locking.IsLocked())
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemLockedByAnotherUser));
                }
            }
        }
    }
}
