// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using System.Linq;
using Newtonsoft.Json;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Shell;
using Sitecore.StringExtensions;

namespace Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem
{
    /// <summary>
    /// Parses the Xml into the data structure.
    /// </summary>
    internal class CheckFieldModified : IHorizonPipelineProcessor<HorizonSaveItemArgs>
    {
        private readonly ISitecoreContext _context;
        private readonly IPresentationDetailsRepository _presentationDetailsRepository;

        public CheckFieldModified(ISitecoreContext context, IPresentationDetailsRepository presentationDetailsRepository)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _presentationDetailsRepository = presentationDetailsRepository;
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
                if (item == null || saveItem.Fields == null)
                {
                    continue;
                }

                if (saveItem.Revision.IsNullOrEmpty())
                {
                    continue;
                }

                string actualRevision = item[FieldIDs.Revision].Replace("-", string.Empty);
                string saveRevision = saveItem.Revision.Replace("-", string.Empty);

                // If the field value is being set from webedit programmatically and revision is not supplied, we have nothing to compare with and hence ignore the revision check
                if (string.Equals(actualRevision, saveRevision, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(EditorConstants.IgnoreRevision, saveRevision, StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                args.Warnings.Add(SaveItemErrorCode.ItemWasModified.ToString());

                foreach (HorizonArgsSaveField saveField in saveItem.Fields)
                {
                    if (IsSameFieldValue(saveField, item))
                    {
                        continue;
                    }

                    args.AddErrorAndAbortPipeline(new SaveItemError(saveItem.ID, SaveItemErrorCode.FieldWasModified));
                    return;
                }
            }
        }

        private static string JsonInvariant(object value)
        {
            var settings = new JsonSerializerSettings
            {
                Culture = CultureInfo.InvariantCulture
            };

            return JsonConvert.SerializeObject(value, settings);
        }


        private bool IsSameFieldValue(HorizonArgsSaveField saveField, Item item)
        {
            if (saveField.ID == FieldIDs.FinalLayoutField || saveField.ID == FieldIDs.LayoutField)
            {
                var actualPresentationDetails = JsonInvariant(_presentationDetailsRepository.GetItemPresentationDetails(item));
                var saveValuePresentationOriginalValue = saveField.OriginalValue;

                return actualPresentationDetails == saveValuePresentationOriginalValue;
            }


            string actualFieldValue = item.Fields[saveField.ID].Value;
            string saveValueOriginalValue = saveField.OriginalValue;
            return string.Equals(actualFieldValue, saveValueOriginalValue, StringComparison.Ordinal);
        }
    }
}
