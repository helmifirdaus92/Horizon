// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using AutoFixture;
using AutoFixture.AutoNSubstitute;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations;
using Xunit.Sdk;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture
{
    [AttributeUsage(AttributeTargets.Method)]
    [DataDiscoverer("AutoFixture.Xunit2.NoPreDiscoveryDataDiscoverer", "AutoFixture.Xunit2")]
    internal class AutoNDataAttribute : CustomizableAutoDataAttribute
    {
        public AutoNDataAttribute() : base(() =>
        {
            var fixture = new AutoFixture.Fixture();

            fixture.Customize(new AutoNSubstituteCustomization
            {
                ConfigureMembers = true
            });
            fixture.Customize(new SitecoreDomainCustomization());
            fixture.Customize(new WorkaroundForDotCoverFailWithHttpContextBase());

            fixture.Customize(new OmitGqlTypeAutoProperties());

            fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
                .ForEach(b => fixture.Behaviors.Remove(b));
            fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            return fixture;
        })
        {
        }
    }
}
