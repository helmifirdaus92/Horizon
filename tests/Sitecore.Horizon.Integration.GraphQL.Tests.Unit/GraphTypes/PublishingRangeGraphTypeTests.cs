// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class PublishingRangeGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(PublishingRangeGraphType sut, Item itemVersion, DateTime publishDateTime)
        {
            // arrange
            PublishingRange publishingRange = new(publishDateTime, publishDateTime.AddDays(10));
            ItemVersionPublishingRange itemVersionPublishingRange = new(itemVersion, publishingRange);

            // act & assert
            sut.Should().ResolveFieldValueTo("version", itemVersionPublishingRange.ItemVersion.Version.Number, c => c.WithSource(itemVersionPublishingRange));
            sut.Should().ResolveFieldValueTo("publishDate", itemVersionPublishingRange.Range.PublishDate, c => c.WithSource(itemVersionPublishingRange));
            sut.Should().ResolveFieldValueTo("unpublishDate", itemVersionPublishingRange.Range.UnpublishDate, c => c.WithSource(itemVersionPublishingRange));
        }
    }
}
