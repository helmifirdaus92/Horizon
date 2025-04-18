// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Diagnostics.CodeAnalysis;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Unlocks the item.
    /// </summary>
    internal class Unlock : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;
        private readonly BaseLog _log;

        public Unlock(ISitecoreContext context, BaseLog log)
        {
            _context = context;
            _log = log;
        }

        [SuppressMessage("Microsoft.Globalization", "CA1303:DoNotPassLiteralsAsLocalizedParameters", Justification = "Logs any exception and aborts pipeline")]
        [SuppressMessage("Microsoft.Design", "CA1031:DoNotCatchGeneralExceptionTypes", Justification = "Logs any exception and aborts pipeline")]
        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (item == null)
                {
                    continue;
                }

                if (item.Locking.IsLocked() && _context.User.IsAdministrator && !item.Locking.HasLock())
                {
                    continue;
                }

                try
                {
                    item.Locking.Unlock();
                }
                catch (Exception ex)
                {
                    _log.Error($"Item {saveItem.ID} couldn't be automatically unlocked, which was required by the policy-based locking.", ex, this);
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.InternalError));
                }
            }
        }
    }
}
