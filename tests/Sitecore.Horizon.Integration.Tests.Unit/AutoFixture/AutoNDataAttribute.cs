// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using System.Linq;
using AutoFixture;
using AutoFixture.AutoNSubstitute;
using Sitecore.Horizon.Integration.Tests.Unit.AutoFixture.Customizations;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture;
using Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations;
using Xunit.Sdk;

namespace Sitecore.Horizon.Integration.Tests.Unit.AutoFixture
{
    [AttributeUsage(AttributeTargets.Method)]
    [DataDiscoverer("AutoFixture.Xunit2.NoPreDiscoveryDataDiscoverer", "AutoFixture.Xunit2")]
    public class AutoNDataAttribute : CustomizableAutoDataAttribute
    {
        public AutoNDataAttribute() : base(() =>
        {
            var fixture = new Fixture();

            fixture.Customize(new AutoNSubstituteCustomization
            {
                ConfigureMembers = true
            });
            fixture.Customize(new SitecoreDomainCustomization());
            fixture.Customize(new WorkaroundForDotCoverFailWithHttpContextBase());
            fixture.Customize(new HorizonSimulatorCustomization());
            fixture.Customize(new HorizonPipelineCustomizations());

            fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
                .ForEach(b => fixture.Behaviors.Remove(b));
            fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            return fixture;
        })
        {
        }
    }
}
