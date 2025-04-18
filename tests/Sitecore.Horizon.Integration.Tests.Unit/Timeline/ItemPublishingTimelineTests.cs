// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using AutoFixture.Idioms;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Xunit;

namespace Sitecore.Horizon.Integration.Tests.Unit.Timeline
{
    public class ItemPublishingTimelineTests
    {
        [Theory]
        [AutoNData]
        internal void Guard(IFixture fixture)
        {
            // arrange
            var assertion = new GuardClauseAssertion(fixture);

            // act
            // assert
            assertion.Verify(typeof(ItemPublishingTimeline));
        }
    }
}
