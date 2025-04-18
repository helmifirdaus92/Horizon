// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Locks the item.
    /// </summary>
    internal class Lock : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;
        private readonly BaseLog _log;

        public Lock(ISitecoreContext context, BaseLog log)
        {
            _context = context;
            _log = log;
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">
        /// The arguments.
        /// </param>
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

                var originalVersions = item.Versions.GetVersionNumbers().Select(v => v.Number);

                if (item.Locking.HasLock())
                {
                    continue;
                }

                try
                {
                    if (item.Locking.IsLocked())
                    {
                        if (!_context.User.IsAdministrator)
                        {
                            args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemLockedByAnotherUser));
                        }
                    }
                    else
                    {
                        item = _context.WorkflowStartEditing(item);
                        if (!item.Locking.IsLocked())
                        {
                            item.Locking.Lock();
                        }
                    }

                    HorizonArgsSaveField lockField = saveItem.Fields.FirstOrDefault(f => f.ID == FieldIDs.Lock);
                    if (lockField != null)
                    {
                        string lockValue = item[FieldIDs.Lock];
                        if (string.Compare(lockField.Value, lockValue, StringComparison.OrdinalIgnoreCase) != 0)
                        {
                            lockField.Value = lockValue;
                        }
                    }

                    ProcessAutoCreatedNewVersion(ref args, originalVersions, item);

                    saveItem.Version = item.Version;
                }
                catch (Exception ex)
                {
                    _log.Error($"Item {saveItem.ID} couldn't be locked.", ex, this);

                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.InternalError));
                }
            }
        }

        private static void ProcessAutoCreatedNewVersion(ref HorizonSaveItemArgs args, IEnumerable<int> originalVersions, Item item)
        {
            if (!originalVersions.Contains(item.Version.Number))
            {
                args.NewCreatedVersions.Add(new ItemVersionInfo
                {
                    ItemId = item.ID.Guid,
                    VersionNumber = item.Version.Number,
                    DisplayName = item.DisplayName
                });
            }
        }
    }
}
