// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ItemTimelineGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(ItemTimelineGraphType sut, Item itemVersion1, Item itemVersion2, DateTime publishDate1, DateTime publishDate2)
        {
            // arrange
            ItemPublishingTimeline itemPublishingTimeline = new(itemVersion1.ID, new[]
            {
                new ItemVersionPublishingRange(itemVersion1, new PublishingRange(publishDate1, publishDate1.AddDays(10))),
                new ItemVersionPublishingRange(itemVersion2, new PublishingRange(publishDate2, publishDate2.AddDays(10)))
            });

            // act & assert
            sut.Should().ResolveFieldValueTo("id", itemPublishingTimeline.ItemId, c => c.WithSource(itemPublishingTimeline));
            sut.Should().ResolveFieldValueTo("ranges", itemPublishingTimeline.PublishingRanges, c => c.WithSource(itemPublishingTimeline));
        }
    }
}
