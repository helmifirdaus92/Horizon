// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Data.Fields;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Checks for broken links.
    /// </summary>
    internal class CheckTemplateFieldChange : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public CheckTemplateFieldChange(ISitecoreContext context)
        {
            _context = context;
        }

        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);

                if (item == null || item.TemplateID != TemplateIDs.TemplateField)
                {
                    continue;
                }

                HorizonArgsSaveField? sharedSaveField = GetField(saveItem, TemplateFieldIDs.Shared);
                HorizonArgsSaveField? unversionedSaveField = GetField(saveItem, TemplateFieldIDs.Unversioned);

                Field sharedField = item.Fields[TemplateFieldIDs.Shared];
                Field unversionedField = item.Fields[TemplateFieldIDs.Unversioned];

                bool sharedFieldChanged = sharedSaveField != null && sharedSaveField.Value != sharedField.Value;
                bool unversionedFieldChanged = unversionedSaveField != null && unversionedSaveField.Value != unversionedField.Value;

                if (sharedFieldChanged || unversionedFieldChanged)
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.ChangedUnversionedOrSharedFlag));
                    return;
                }
            }
        }

        /// <summary>
        /// Gets the field.
        /// </summary>
        /// <param name="saveItem">The save item.</param>
        /// <param name="id">The id.</param>
        /// <returns>The field.</returns>
        private static HorizonArgsSaveField? GetField(HorizonArgsSaveItem saveItem, ID id)
        {
            Assert.ArgumentNotNull(saveItem, nameof(saveItem));
            Assert.ArgumentNotNull(id, nameof(id));

            foreach (HorizonArgsSaveField saveField in saveItem.Fields)
            {
                if (saveField.ID == id)
                {
                    return saveField;
                }
            }

            return null;
        }
    }
}
