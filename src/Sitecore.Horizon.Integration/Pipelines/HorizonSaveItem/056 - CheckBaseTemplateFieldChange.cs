// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Checks whether BaseTemplate field was changed
    /// </summary>
    internal class CheckBaseTemplateFieldChange : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;

        public CheckBaseTemplateFieldChange(ISitecoreContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Processes the specified args.
        /// </summary>
        /// <param name="args">The args.</param>
        public void Process(ref HorizonSaveItemArgs args)
        {
            foreach (HorizonArgsSaveItem saveItem in args.Items)
            {
                Item? item = _context.ContentDatabase?.GetItem(saveItem.ID, saveItem.Language, saveItem.Version);

                if (item == null || !item.Database.Engines.TemplateEngine.IsTemplate(item))
                {
                    continue;
                }

                var baseField = saveItem.Fields.FirstOrDefault(field => (field.ID == FieldIDs.BaseTemplate));
                if (baseField != null && AreBaseTemplatesRemoved(item[FieldIDs.BaseTemplate], baseField.Value))
                {
                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.BaseTemplateWasChanged));
                    return;
                }
            }
        }

        /// <summary>
        /// Determines whether base templates were removed.
        /// </summary>
        /// <param name="baseTemplateFieldValue">The base template field value.</param>
        /// <param name="newFieldValue">The new field value.</param>
        /// <returns>
        ///   <c>true</c> if base templates were removed otherwise, <c>false</c>.
        /// </returns>
        private static bool AreBaseTemplatesRemoved(string baseTemplateFieldValue, string newFieldValue)
        {
            string[] baseTemplatesIdsChanged = newFieldValue.Split(new[]
            {
                '|'
            }, StringSplitOptions.RemoveEmptyEntries);
            string[] baseTemplatesIds = baseTemplateFieldValue.Split(new[]
            {
                '|'
            }, StringSplitOptions.RemoveEmptyEntries);

            int count = baseTemplatesIdsChanged.Intersect(baseTemplatesIds, StringComparer.OrdinalIgnoreCase).Count();
            return count < baseTemplatesIds.Length;
        }
    }
}
