// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Globalization;
using GraphQL.Types;
using Sitecore.Abstractions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Globalization;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.Schema;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Publishing;
using Version = Sitecore.Data.Version;

namespace Sitecore.Horizon.Integration.GraphQL.Mutations.Publishing
{
    internal class HorizonPublishingMutations : ObjectGraphType
    {
        private readonly IItemPermissionChecker _itemPermissionChecker;
        private readonly IPublishingTargetInfo _publishingTargetInfo;
        private readonly BasePublishManager _publishManager;
        private readonly BaseLanguageManager _languageManager;
        private readonly IHorizonItemHelper _itemHelper;
        private readonly ISitecoreContext _scContext;
        private readonly IHorizonMutationHelper _horizonMutationsHelper;

        public HorizonPublishingMutations(IItemPermissionChecker itemPermissionChecker, IPublishingTargetInfo publishingTargetInfo, BasePublishManager publishManager, BaseLanguageManager languageManager,
            IHorizonItemHelper itemHelper, ISitecoreContext scContext, IHorizonMutationHelper horizonMutationsHelper)
        {
            _itemPermissionChecker = itemPermissionChecker;
            _publishingTargetInfo = publishingTargetInfo;
            _publishManager = publishManager;
            _languageManager = languageManager;
            _itemHelper = itemHelper;
            _scContext = scContext;
            _horizonMutationsHelper = horizonMutationsHelper;

            Field<PublishItemOutput>(
                "publishItem",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<PublishItemInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<PublishItemInput>("input");
                    return PublishItem(input.ItemId, input.PublishSubitems, input.Language, input.Site);
                });

            Field<SetPublishingSettingsOutput>(
                "setPublishingSettings",
                arguments: new QueryArguments(
                    new QueryArgument<NonNullGraphType<SetPublishingSettingsInput>>
                    {
                        Name = "input"
                    }
                ),
                resolve: ctx =>
                {
                    var input = ctx.GetArgument<SetPublishingSettingsInput>("input");
                    return SetPublishingSettings(input.Path, input.VersionNumber, input.Language, input.Site, input.ValidFromDate, input.ValidToDate, input.IsAvailableToPublish);
                });
        }

        private Handle PublishItem(string itemPath, bool publishSubItems, string language, string site)
        {
            _scContext.SetQueryContext(language: language, site: site);

            Item item = _itemHelper.GetItem(itemPath) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            if (!_itemPermissionChecker.CanPublish(item, _scContext.User))
            {
                throw new HorizonGqlError(GenericErrorCodes.InsufficientPrivileges);
            }

            Database[] targets = _publishingTargetInfo.GetTargetDatabases();

            Language[] languages =
            {
                _languageManager.GetLanguage(item.Language.Name)
            };

            var handle = _publishManager.PublishItem(item: item, targets: targets, languages: languages, deep: publishSubItems,
                compareRevisions: true, publishRelatedItems: true);

            return handle;
        }

        private SetPublishingSettingsResult SetPublishingSettings(string itemPath, int versionNumber, string language, string site,
            string validFrom, string validTo, bool isAvailableToPublish)
        {
            _scContext.SetQueryContext(language: language, site: site);
            Item item = _itemHelper.GetItem(itemPath, Version.Parse(versionNumber)) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);

            _horizonMutationsHelper.VerifyCanEditField(item, FieldIDs.ValidFrom);
            _horizonMutationsHelper.VerifyCanEditField(item, FieldIDs.ValidTo);

            using (new EditContext(item))
            {
                item.Publishing.ValidFrom = ConvertToUniversalTime(validFrom, DateTimeOffset.MinValue.UtcDateTime);
                item.Publishing.ValidTo = ConvertToUniversalTime(validTo, DateTimeOffset.MaxValue.UtcDateTime);
                item.Publishing.HideVersion = !isAvailableToPublish;
            }

            return new SetPublishingSettingsResult(item);
        }

        private static DateTime ConvertToUniversalTime(string dateTimeString, DateTime fallbackDateTime)
        {
            var dateTime = DateTime.TryParse(dateTimeString, new CultureInfo(Constants.DefaultCulture).DateTimeFormat, DateTimeStyles.AdjustToUniversal, out DateTime validDateTime)
                ? validDateTime : fallbackDateTime;
            return DateUtil.ToUniversalTime(dateTime);
        }
    }
}
