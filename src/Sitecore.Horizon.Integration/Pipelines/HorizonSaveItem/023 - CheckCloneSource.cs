// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using Sitecore.Abstractions;
using Sitecore.Configuration;
using Sitecore.Configuration.KnownSettings;
using Sitecore.Data.Clones.ItemSourceUriProviders;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;
using Sitecore.StringExtensions;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Ensures an item with 'broken' <see cref="FieldIDs.SourceItem"/> source field for <see cref="Settings.ItemCloning"/> cannot be saved.
    /// </summary>
    internal class CheckCloneSource : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISourceUriProvider _itemSourceUriProvider;
        private readonly BaseSettings _settings;
        private readonly ISitecoreContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="CheckCloneSource"/> class.
        /// </summary>
        public CheckCloneSource(ISourceUriProvider itemSourceUriProvider, BaseSettings settings, ISitecoreContext context)
        {
            _itemSourceUriProvider = itemSourceUriProvider ?? throw new ArgumentNullException(nameof(itemSourceUriProvider));
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        /// <summary>
        /// Runs the processor.
        /// </summary>
        /// <param name="args">The arguments.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            if (!_settings.ItemCloning().Enabled)
            {
                return;
            }

            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                HorizonArgsSaveField? sourceItemSharedFieldChange = saveItem.Fields.FirstOrDefault(modifiedField => modifiedField.ID.Equals(FieldIDs.SourceItem) && !modifiedField.Value.IsNullOrEmpty());
                if (sourceItemSharedFieldChange == null)
                {
                    continue;
                }

                Item? existingItem = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);
                if (existingItem == null)
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ItemDoesNotExist));
                    return;
                }

                if (!_itemSourceUriProvider.IsValidSourceFieldValue(existingItem, sourceItemSharedFieldChange.Value))
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.IncorrectCloneSource));
                    return;
                }
            }
        }
    }
}
