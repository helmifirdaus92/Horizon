// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.Horizon.Tests.Unit.Shared;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class PublishingTimelineRestrictionTests
    {
        [Theory]
        [AutoNData]
        internal void Constructor_ShouldCreateObject(PublishingRange range)
        {
            // arrange, act, assert

            // create with single range
            Invoking.Action(() => new PublishingTimelineRestriction(range)).Should().NotThrow();

            // create with array
            Invoking.Action(() => new PublishingTimelineRestriction(new[]
            {
                range
            })).Should().NotThrow();
        }
    }
}
