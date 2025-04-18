// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using AutoFixture;
using Sitecore.Horizon.Integration.Timeline;
using Sitecore.NSubstituteUtils;

namespace Sitecore.Horizon.Integration.Tests.Unit.AutoFixture.Customizations
{
    public class HorizonSimulatorCustomization : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((DateTime publishDate, TimeSpan diff) => new PublishingRange(publishDate, publishDate.Add(diff)));
            fixture.Register((FakeItem item, PublishingRange range) => new ItemVersionPublishingRange(item.ToSitecoreItem(), range));
            fixture.Register((PublishingRange range) => new PublishingTimelineRestriction(range));
        }
    }
}
