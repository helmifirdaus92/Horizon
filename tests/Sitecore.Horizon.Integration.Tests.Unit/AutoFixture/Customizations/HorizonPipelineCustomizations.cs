// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using NSubstitute;
using Sitecore.Horizon.Integration.Pipelines;

namespace Sitecore.Horizon.Integration.Tests.Unit.AutoFixture.Customizations
{
    public class HorizonPipelineCustomizations : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            // Inject NSubstitute proxy directly.
            // The reason is that pipelines contain by ref arg which is assigned by AutoFixture.
            // In this case it would break us in many places, so better simply skip AF customization.
            fixture.Inject(Substitute.For<IHorizonPipelines>());
        }
    }
}
