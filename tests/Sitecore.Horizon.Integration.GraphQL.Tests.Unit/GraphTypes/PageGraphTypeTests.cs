// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture.Xunit2;
using FluentAssertions;
using Newtonsoft.Json;
using NSubstitute;
using NSubstitute.Extensions;
using NSubstitute.ReturnsExtensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.Canvas;
using Sitecore.Horizon.Integration.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.Diagnostics;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Integration.Items.Workflow;
using Sitecore.Horizon.Integration.Languages;
using Sitecore.Horizon.Integration.Presentation;
using Sitecore.Horizon.Integration.Presentation.Mapper;
using Sitecore.Horizon.Integration.Presentation.Models;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PageGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldThrowArgumentNullException_WhenTimelineProviderIsNull(IHorizonItemHelper itemHelper,
            ISitecoreContext scContext,
            IHorizonWorkflowManager workflowManager,
            IClientLanguageService clientLanguageService,
            IHorizonItemTreeBuilder itemTreeBuilder,
            IPresentationDetailsRepository presentationDetailsRepository)
        {
            // arrange
            IPublishingTimelineProvider timelineProvider = null;

            // act & assert
            Invoking.Action(() => new PageGraphType(itemHelper, scContext, timelineProvider, workflowManager, clientLanguageService, itemTreeBuilder, presentationDetailsRepository)).Should().Throw<ArgumentNullException>();
        }

        [Theory, AutoNData]
        internal void ShouldResolveUrlField([Frozen] IHorizonItemHelper itemHelper, PageGraphType sut, Item item, string linkUrl)
        {
            // arrange
            itemHelper.GenerateLinkWithoutLanguage(item).Returns(linkUrl);

            // act & assert
            sut.Should().ResolveFieldValueTo("url", linkUrl, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldResolveRouteField([Frozen] IHorizonItemHelper itemHelper, PageGraphType sut, Item item, string route)
        {
            // arrange
            itemHelper.GenerateItemRoute(item).Returns(route);

            // act & assert
            sut.Should().ResolveFieldValueTo("route", route, c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void ShouldResolveSharedPresentationDetailsField(
            [Frozen] IPresentationDetailsRepository presentationDetailsRepository,
            PageGraphType sut,
            Item item,
            PresentationDetails presentationDetails)
        {
            // arrange
            presentationDetailsRepository.GetItemSharedPresentationDetails(item).Returns(presentationDetails);

            // act & assert
            sut.Should().ResolveFieldValueTo("sharedPresentationDetails", JsonConvert.SerializeObject(presentationDetails), c => c.WithSource(item));
        }

        [Theory, AutoNData]
        internal void GetPageTimeline_ShouldResolveField([Frozen] IPublishingTimelineProvider timelineProvider,
            PageGraphType sut,
            Item page,
            Item datasource,
            DateTime pagePublishDateTime,
            DateTime datasource1PublishDateTime)
        {
            // arrange
            ItemPublishingTimeline pagePublishingTimeline = new(page.ID, new[]
            {
                new ItemVersionPublishingRange(page, new PublishingRange(pagePublishDateTime, pagePublishDateTime.AddDays(10)))
            });

            ItemPublishingTimeline[] datasourcesPublishingTimelines =
            {
                new(datasource.ID, new[]
                {
                    new ItemVersionPublishingRange(datasource, new PublishingRange(datasource1PublishDateTime, datasource1PublishDateTime.AddDays(10)))
                }),
            };
            var expectedTimeline = new PageTimelineInfo(pagePublishingTimeline, datasourcesPublishingTimelines);
            timelineProvider.BuildPageTimeline(Arg.Any<Item>()).Returns(pagePublishingTimeline);
            timelineProvider.BuildDataSourceTimelines(Arg.Any<ItemPublishingTimeline>(), Arg.Any<DeviceItem>()).Returns(datasourcesPublishingTimelines);

            // act & assert
            sut.Should().ResolveFieldValueTo("timeline", expectedTimeline, c => c.WithSource(page));
        }

        [Theory, AutoNData]
        internal void GetPageTimeline_ShouldThrowException_WhenItemIsNotFound([Frozen] IHorizonItemHelper itemHelper, PageGraphType sut, Item item)
        {
            // arrange
            itemHelper.Configure().GetItem(item.ID).ReturnsNull();

            // act & assert
            sut.Invoking(s => s.ResolveFieldValue<Item[]>("timeline",
                c => c.WithSource(item))).Should().Throw<HorizonGqlError>().WithErrorCode(ItemErrorCode.ItemNotFound);
        }
    }
}
