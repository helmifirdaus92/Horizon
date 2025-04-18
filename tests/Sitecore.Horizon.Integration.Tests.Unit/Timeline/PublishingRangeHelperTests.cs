// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using FluentAssertions;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class PublishingRangeHelperTests
    {
        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeSameAsRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddDays(1));
            var range = currentRange;

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().Be(currentRange);
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeAfterRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range = new PublishingRange(date.AddDays(-2), date.AddDays(-1));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeBeforeRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddDays(1));
            var range = new PublishingRange(date.AddYears(1), date.AddYears(2));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().BeNull();
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeEnclosesRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range = new PublishingRange(date.AddDays(1), date.AddDays(2));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().Be(range);
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeInsideRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddDays(1));
            var range = new PublishingRange(date.AddDays(-1), date.AddYears(1));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().Be(currentRange);
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeStartsInsideRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range = new PublishingRange(date.AddDays(-1), date.AddDays(1));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().Be(new PublishingRange(currentRange.PublishDate, range.UnpublishDate));
        }

        [Theory]
        [AutoNData]
        internal void GetIntersection_CurrentRangeEndsInsideRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range = new PublishingRange(date.AddDays(1), date.AddYears(2));

            // act
            PublishingRange? intersection = sut.GetIntersection(currentRange, range);

            // assert
            intersection.Should().Be(new PublishingRange(range.PublishDate, currentRange.UnpublishDate));
        }

        [Theory]
        [AutoNData]
        internal void SubtractRanges_CurrentRangeDoesNotHaveIntersectionWithRanges(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddDays(1));

            var rangesToSubtract = new[]
            {
                new PublishingRange(date.AddYears(1), date.AddYears(2))
            };

            // act
            var result = sut.SubtractRanges(currentRange, rangesToSubtract);

            // assert
            result.Should().HaveCount(1);
            result.First().Should().Be(currentRange);
        }

        [Theory]
        [AutoNData]
        internal void SubtractRanges_CurrentRangeInsideSingleRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddDays(1));

            var rangesToSubtract = new[]
            {
                new PublishingRange(date.AddYears(-1), date.AddYears(1))
            };

            // act
            var result = sut.SubtractRanges(currentRange, rangesToSubtract);

            // assert
            result.Should().BeEmpty();
        }

        [Theory]
        [AutoNData]
        internal void SubtractRanges_CurrentRangeEnclosesSingleRange(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range = new PublishingRange(date.AddDays(1), date.AddDays(2));

            var rangesToSubtract = new[]
            {
                range
            };

            // act
            var result = sut.SubtractRanges(currentRange, rangesToSubtract);

            // assert
            result.Should().BeEquivalentTo(
                new PublishingRange(currentRange.PublishDate, range.PublishDate),
                new PublishingRange(range.UnpublishDate, currentRange.UnpublishDate)
            );
        }

        [Theory]
        [AutoNData]
        internal void SubtractRanges_CurrentRangeEnclosesManyRanges(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var currentRange = new PublishingRange(date, date.AddYears(1));
            var range1 = new PublishingRange(date.AddDays(1), date.AddDays(2));
            var range2 = new PublishingRange(date, date.AddDays(5));
            var range3 = new PublishingRange(date.AddMonths(1), date.AddMonths(2));

            var rangesToSubtract = new[]
            {
                range1,
                range2,
                range3
            };

            // act
            var result = sut.SubtractRanges(currentRange, rangesToSubtract);

            // assert
            result.Should().BeEquivalentTo(
                new PublishingRange(range2.UnpublishDate, range3.PublishDate),
                new PublishingRange(range3.UnpublishDate, currentRange.UnpublishDate)
            );
        }

        [Theory]
        [AutoNData]
        internal void MergeOverlappedRanges_ShouldMergeAllOverlappedRanges(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var range1 = new PublishingRange(date, date.AddYears(1));

            var range2 = new PublishingRange(range1.PublishDate.AddMonths(-1), range1.PublishDate.AddMonths(1));

            var range3 = new PublishingRange(range1.UnpublishDate.AddMonths(-1), range1.UnpublishDate.AddMonths(1));

            var ranges = new[]
            {
                range1,
                range2,
                range3
            };

            // act
            var result = sut.MergeOverlappedRanges(ranges);

            // assert
            result.Should().BeEquivalentTo(
                new PublishingRange(range2.PublishDate, range3.UnpublishDate)
            );
        }

        [Theory]
        [AutoNData]
        internal void MergeOverlappedRanges_ShouldKeepRangesWithoutIntersection(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var range1 = new PublishingRange(date, date.AddYears(1));
            var range2 = new PublishingRange(range1.UnpublishDate.AddYears(1), range1.UnpublishDate.AddYears(2));

            var ranges = new[]
            {
                range1,
                range2
            };

            // act
            var result = sut.MergeOverlappedRanges(ranges);

            // assert
            result.Should().BeEquivalentTo(
                range1,
                range2
            );
        }

        [Theory]
        [AutoNData]
        internal void MergeOverlappedRanges_ShouldKeepSingleRangeAsIs(PublishingRangeHelper sut, DateTime date)
        {
            // arrange
            var range = new PublishingRange(date, date.AddYears(1));

            var ranges = new[]
            {
                range
            };

            // act
            var result = sut.MergeOverlappedRanges(ranges);

            // assert
            result.Should().BeEquivalentTo(
                range
            );
        }
    }
}
