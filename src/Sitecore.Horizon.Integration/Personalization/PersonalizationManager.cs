// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Globalization;
using Newtonsoft.Json;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Pipelines;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Models;

namespace Sitecore.Horizon.Integration.Personalization
{
    internal class PersonalizationManager : IPersonalizationManager
    {
        private readonly IPresentationDetailsRepository _presentationDetailsRepository;
        private readonly ISitecoreContext _scContext;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISaveArgsBuilder _saveArgsBuilder;
        private readonly IHorizonPipelines _horizonPipelines;

        public PersonalizationManager(
            ISitecoreContext scContext,
            IHorizonItemHelper horizonItemHelper,
            IHorizonPipelines horizonPipelines,
            ISaveArgsBuilder saveArgsBuilder,
            IPresentationDetailsRepository presentationDetailsRepository)
        {
            _scContext = scContext;
            _itemHelper = horizonItemHelper;
            _horizonPipelines = horizonPipelines;
            _saveArgsBuilder = saveArgsBuilder;
            _presentationDetailsRepository = presentationDetailsRepository;
        }

        public void DeleteLayoutRules(Item item, string variantId)
        {
            CleanupItemsPersonalization(item.Versions.GetVersions(), variantId);
        }

        public void CleanupPersonalization(Item item, bool applyForSubitems)
        {
            var items = new List<Item>();
            items.AddRange(GetAllItemVersions(item));

            if (applyForSubitems)
            {
                var descendants = item.Axes.GetDescendants();
                foreach (var descendant in descendants)
                {
                    items.AddRange(GetAllItemVersions(descendant));
                }
            }

            CleanupItemsPersonalization(items.ToArray());
        }

        private static string JsonInvariant(object value)
        {
            var settings = new JsonSerializerSettings
            {
                Culture = CultureInfo.InvariantCulture
            };

            return JsonConvert.SerializeObject(value, settings);
        }

        private Item[] GetAllItemVersions(Item item)
        {
            var versions = new List<Item>();
            foreach (Language language in item.Languages)
            {
                var languageVersionItem = _scContext.Database.GetItem(item.ID, language);
                if (languageVersionItem != null)
                {
                    versions.AddRange(languageVersionItem.Versions.GetVersions());
                }
            }

            return versions.ToArray();
        }


        private void CleanupItemsPersonalization(Item[] items, string? variantId = null)
        {
            var itemEntries = new List<SaveItemDetails>();

            foreach (var item in items)
            {
                PresentationDetails presentationDetails = _presentationDetailsRepository.GetItemPresentationDetails(item);
                foreach (DeviceModel presentationDetail in presentationDetails.Devices)
                {
                    foreach (RenderingModel rendering in presentationDetail.Renderings)
                    {
                        if (variantId == null)
                        {
                            rendering.Personalization = null;
                        }
                        else
                        {
                            rendering.Personalization?.RuleSet?.Rules.RemoveAll(rule => rule.Name == variantId);

                            // remove default rule if it is the only rule remained
                            if (rendering.Personalization?.RuleSet?.Rules.Count == 1)
                            {
                                var defaultRule = rendering.Personalization.RuleSet.Rules[0];
                                if (new ID(defaultRule.UniqueId) == ID.Null)
                                {
                                    rendering.Personalization = null;
                                }
                            }
                        }
                    }
                }

                itemEntries.Add(new SaveItemDetails
                {
                    ItemId = item.ID.ToString(),
                    ItemVersion = item.Version.ToInt32(),
                    ItemLanguage = item.Language.Name,
                    PresentationDetails = new PresentationDetailsInfo
                    {
                        Kind = LayoutKind.Final,
                        Body = JsonInvariant(presentationDetails)
                    },
                });
            }

            SaveChanges(itemEntries);
        }

        private void SaveChanges(List<SaveItemDetails> saveItemDetailsList)
        {
            HorizonSaveItemArgs args = _saveArgsBuilder.BuildSaveArgs(saveItemDetailsList);
            if (args.Errors.Count > 0)
            {
                return;
            }

            // ContentDatabase is required, as all the save pipeline processors use it.
            if (_scContext.ContentDatabase == null)
            {
                try
                {
                    _scContext.ContentDatabase = _scContext.Database;

                    _horizonPipelines.SaveItem(ref args);
                }
                finally
                {
                    _scContext.ContentDatabase = null;
                }
            }
            else
            {
                _horizonPipelines.SaveItem(ref args);
            }
        }
    }
}
