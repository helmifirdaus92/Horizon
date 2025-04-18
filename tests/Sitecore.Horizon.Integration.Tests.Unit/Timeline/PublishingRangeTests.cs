// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using FluentAssertions;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class PublishingRangeTests
    {
        [Theory]
        [InlineAutoNData(0)]
        [InlineAutoNData(-1)]
        internal void Constructor_ShouldThrowWhenDatesAreNotValid(int daysDiff, DateTime publishDate)
        {
            // arrange, act, assert
            Invoking.Action(() => new PublishingRange(publishDate, publishDate.AddDays(daysDiff))).Should().Throw<ArgumentException>();
        }

        [Theory]
        [AutoNData]
        internal void Constructor_ShouldNotThrowWhenDatesAreValid(DateTime publishDate)
        {
            // arrange, act, assert
            Invoking.Action(() => new PublishingRange(publishDate, publishDate.AddDays(1))).Should().NotThrow();
        }

        [Theory]
        [AutoNData]
        internal void Equality_ShouldCompareByFields(DateTime publishDate)
        {
            // arrange
            PublishingRange range = new PublishingRange(publishDate, publishDate.AddDays(1));
            PublishingRange sameRange = new PublishingRange(range.PublishDate, range.UnpublishDate);
            PublishingRange differentRange = new PublishingRange(range.PublishDate.AddDays(1), range.UnpublishDate.AddDays(1));

            // act
            // assert
            range.Equals(sameRange).Should().BeTrue();
            range.Equals((object)sameRange).Should().BeTrue();
            (range == sameRange).Should().BeTrue();
            (range != differentRange).Should().BeTrue();
            range.GetHashCode().Should().Be(sameRange.GetHashCode());

            range.Equals(differentRange).Should().BeFalse();
            range.Equals((object)differentRange).Should().BeFalse();
            (range == differentRange).Should().BeFalse();
            (range != sameRange).Should().BeFalse();
            range.GetHashCode().Should().NotBe(differentRange.GetHashCode());

            Invoking.Action(() => range.Equals(null)).Should().NotThrow();
        }

        [Theory]
        [AutoNData]
        internal void CreateValidRangeOrNull_ShouldReturnRangeForValidDates(DateTime publishDate)
        {
            // arrange

            // act
            PublishingRange? range = PublishingRange.CreateValidRangeOrNull(publishDate, publishDate.AddDays(1));

            // assert
            range.Should().NotBeNull();
        }

        [Theory]
        [AutoNData]
        internal void CreateValidRangeOrNull_ShouldReturnNullForInvalidDates(DateTime publishDate)
        {
            // arrange

            // act
            PublishingRange? range = PublishingRange.CreateValidRangeOrNull(publishDate, publishDate.AddDays(-1));

            // assert
            range.Should().BeNull();
        }
    }
}
