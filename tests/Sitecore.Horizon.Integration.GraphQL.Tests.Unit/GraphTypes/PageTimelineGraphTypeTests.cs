// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PageTimelineGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(PageTimelineGraphType sut,
            Item page,
            Item datasource1,
            Item datasource2,
            DateTime pagePublishDateTime,
            DateTime datasource1PublishDateTime,
            DateTime datasource2PublishDateTime)
        {
            // arrange
            ItemPublishingTimeline pagePublishingTimeline = new(page.ID, new[]
            {
                new ItemVersionPublishingRange(page, new PublishingRange(pagePublishDateTime, pagePublishDateTime.AddDays(10)))
            });

            ItemPublishingTimeline[] datasourcesPublishingTimelines =
            {
                new(datasource1.ID, new[]
                {
                    new ItemVersionPublishingRange(datasource1, new PublishingRange(datasource1PublishDateTime, datasource1PublishDateTime.AddDays(10)))
                }),
                new(datasource2.ID, new[]
                {
                    new ItemVersionPublishingRange(datasource2, new PublishingRange(datasource2PublishDateTime, datasource2PublishDateTime.AddDays(10)))
                })
            };

            PageTimelineInfo pageTimelineInfo = new(pagePublishingTimeline, datasourcesPublishingTimelines);


            // act & assert
            sut.Should().ResolveFieldValueTo("page", pageTimelineInfo.PageTimeline, c => c.WithSource(pageTimelineInfo));
            sut.Should().ResolveFieldValueTo("datasources", pageTimelineInfo.DataSourceTimelines, c => c.WithSource(pageTimelineInfo));
        }
    }
}
