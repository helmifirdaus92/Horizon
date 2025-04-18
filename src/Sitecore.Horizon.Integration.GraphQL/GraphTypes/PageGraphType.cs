// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Collections.Generic;
using System.Globalization;
using GraphQL.Types;
using Newtonsoft.Json;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Saving;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Sites;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Web.UI.HtmlControls;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class PageGraphType : ContentItemGraphType
    {
        private readonly IPublishingTimelineProvider _timelineProvider;
        private readonly IPresentationDetailsRepository _presentationDetailsRepository;

        public PageGraphType(IHorizonItemHelper itemHelper, ISitecoreContext scContext, IPublishingTimelineProvider timelineProvider, IHorizonWorkflowManager workflowManager, IClientLanguageService clientLanguageService,
            IHorizonItemTreeBuilder itemTreeBuilder, IPresentationDetailsRepository presentationDetailsRepository)
            : base(implementContentInterface: true, itemHelper, scContext, workflowManager, clientLanguageService, itemTreeBuilder)
        {
            _timelineProvider = timelineProvider ?? throw new ArgumentNullException(nameof(timelineProvider));
            _presentationDetailsRepository = presentationDetailsRepository ?? throw new ArgumentNullException(nameof(presentationDetailsRepository));

            Name = "Page";

            Field<PageTimelineGraphType>("timeline", resolve: ctx => GetPageTimeline(ctx.Source));

            Field<StringGraphType>(
                "url",
                resolve: ctx => itemHelper.GenerateLinkWithoutLanguage(ctx.Source)
            );

            Field<StringGraphType>(
                "route",
                resolve: ctx => itemHelper.GenerateItemRoute(ctx.Source)
            );

            Field<StringGraphType>(
                "presentationDetails",
                resolve: ctx => GetPresentationDetails(ctx.Source)
            );
            Field<StringGraphType>(
                "sharedPresentationDetails",
                resolve: ctx => GetSharedPresentationDetails(ctx.Source)
            );

            Field<NonNullGraphType<EnumerationGraphType<LayoutKind>>>("layoutEditingKind", resolve: _ => GetLayoutKind()
            );
        }

        private static string JsonInvariant(object value)
        {
            var settings = new JsonSerializerSettings
            {
                Culture = CultureInfo.InvariantCulture
            };

            return JsonConvert.SerializeObject(value, settings);
        }


        private object GetPageTimeline(Item source)
        {
            Item pageItem;

            // Page item could be non-publishable by restrictions, so re-fetch without filtering
            using (new SiteFilteringSwitcher(disableFiltering: true))
            {
                pageItem = _itemHelper.GetItem(source.ID) ?? throw new HorizonGqlError(ItemErrorCode.ItemNotFound);
            }

            DeviceItem device = _scContext.Device ?? throw new HorizonGqlError(GenericErrorCodes.UnknownError, "Context device is null");

            ItemPublishingTimeline pageTimeline = _timelineProvider.BuildPageTimeline(pageItem);

            ICollection<ItemPublishingTimeline> dataSourceTimelines = _timelineProvider.BuildDataSourceTimelines(pageTimeline, device);

            return new PageTimelineInfo(pageTimeline, dataSourceTimelines);
        }

        private string GetPresentationDetails(Item item)
        {
            var presentationDetails = _presentationDetailsRepository.GetItemPresentationDetails(item);
            return JsonInvariant(presentationDetails);
        }

        private string GetSharedPresentationDetails(Item item)
        {
            var presentationDetails = _presentationDetailsRepository.GetItemSharedPresentationDetails(item);
            return JsonInvariant(presentationDetails);
        }

        private static LayoutKind GetLayoutKind()
        {
            var editAllVersions = Registry.GetString(ExperienceEditor.Constants.RegistryKeys.EditAllVersions);
            return editAllVersions.Equals("on", StringComparison.OrdinalIgnoreCase)
                ? LayoutKind.Shared
                : LayoutKind.Final;
        }
    }
}
