// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Newtonsoft.Json;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Pipelines.Save;

namespace Sitecore.Horizon.Integration.Items.Saving
{
    internal class SaveArgsBuilder : ISaveArgsBuilder
    {
        private readonly IHorizonItemUtil _presentationHelper;
        private readonly IPresentationDetailsMapper _presentationDetailsMapper;
        private readonly IHorizonItemHelper _itemHelper;

        public SaveArgsBuilder(IHorizonItemUtil presentationHelper, IPresentationDetailsMapper presentationDetailsMapper, IHorizonItemHelper itemHelper)
        {
            _presentationHelper = presentationHelper;
            _presentationDetailsMapper = presentationDetailsMapper;
            _itemHelper = itemHelper;
        }

        public HorizonSaveItemArgs BuildSaveArgs(IReadOnlyCollection<SaveItemDetails> saveEntries)
        {
            var result = HorizonSaveItemArgs.Create();

            var saveItems = new List<HorizonArgsSaveItem>();

            foreach (SaveItemDetails itemInput in saveEntries)
            {
                var version = itemInput.ItemVersion.HasValue ? Version.Parse(itemInput.ItemVersion) : Version.Latest;

                var item = !string.IsNullOrEmpty(itemInput.ItemLanguage)
                    ? _itemHelper.GetItem(itemInput.ItemId, version, scope: ItemScope.ContentOnly,
                        Language.Parse(itemInput.ItemLanguage))
                    : _itemHelper.GetItem(itemInput.ItemId, version, scope: ItemScope.ContentOnly);

                if (item == null)
                {
                    // If one of requested items does not exist - we do not need items at all, because save request is failed.
                    if (!ID.TryParse(itemInput.ItemId, out ID itemId))
                    {
                        itemId = ID.Null;
                    }

                    var errorResult = HorizonSaveItemArgs.Create();
                    errorResult.AddErrorAndAbortPipeline(new SaveItemError(itemId, SaveItemErrorCode.ItemDoesNotExist));

                    return errorResult;
                }

                saveItems.Add(MapToSaveItem(itemInput, item));
            }

            result.Items = saveItems;

            return result;
        }

        private static T ParseJsonInvariant<T>(string value)
        {
            var settings = new JsonSerializerSettings
            {
                Culture = CultureInfo.InvariantCulture
            };

            return (JsonConvert.DeserializeObject<T>(value, settings))!;
        }

        private static IEnumerable<HorizonArgsSaveField> PopulateSaveFields(SaveItemDetails saveItemData, Item item)
        {
            if (saveItemData.Fields == null)
            {
                yield break;
            }

            foreach (FieldValueInfo field in saveItemData.Fields)
            {
                var fieldId = new ID(field.Id);
                bool reset = false;
                if(field.Reset != null)
                {
                    reset = field.Reset.Value;
                }

                // We need to use item.Template because when field value is default value -
                // it does not exist on an item.Fields collection,
                if (fieldId != ID.Null && item.Template.Fields.Any(x => x.ID == fieldId))
                {
                    yield return new HorizonArgsSaveField
                    {
                        ID = fieldId,
                        OriginalValue = field.OriginalValue,
                        Value = field.Value,
                        Reset = reset,
                    };
                }
            }
        }

        private HorizonArgsSaveItem MapToSaveItem(SaveItemDetails saveItemData, Item item)
        {
            var fields = PopulateSaveFields(saveItemData, item).ToList();

            PopulatePresentationDetails(saveItemData, item, fields);

            return new HorizonArgsSaveItem
            {
                ID = item.ID,
                Fields = fields.ToList(),
                Language = item.Language,
                Version = item.Version,
                Revision = saveItemData.Revision ?? ""                
            };
        }

        private void PopulatePresentationDetails(SaveItemDetails saveItemData, Item item, List<HorizonArgsSaveField> fields)
        {
            var presentationDetails = saveItemData.PresentationDetails;
            if (presentationDetails == null || string.IsNullOrEmpty(presentationDetails.Body))
            {
                return;
            }

            var layoutDefinition = _presentationDetailsMapper.MapPresentationDetails(ParseJsonInvariant<PresentationDetails>(presentationDetails.Body));

            if (presentationDetails.Kind == LayoutKind.Final)
            {
                fields.Add(new HorizonArgsSaveField
                {
                    ID = FieldIDs.FinalLayoutField,
                    OriginalValue = saveItemData.OriginalPresentationDetails?.Body,
                    Value = _presentationHelper.BuildLayoutDelta(item.Fields[FieldIDs.FinalLayoutField], layoutDefinition.ToXml()),
                    Reset = false
                }); ;
            }
            else if (presentationDetails.Kind == LayoutKind.Shared)
            {
                fields.Add(new HorizonArgsSaveField
                {
                    ID = FieldIDs.LayoutField,
                    OriginalValue = saveItemData.OriginalPresentationDetails?.Body,
                    Value = _presentationHelper.BuildLayoutDelta(item.Fields[FieldIDs.LayoutField], layoutDefinition.ToXml()),
                    Reset = false
                });
            }
        }
    }
}
