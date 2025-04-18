// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreDomainCustomization : CompositeCustomization
    {
        public SitecoreDomainCustomization() :
            base(
                new AutoItemCustomization(),
                new MockSitecoreUser(),
                new MockSitecoreSiteContext(),
                new SitecoreTemplateBuilder(),
                new SitecoreUriBuilder(),
                new SitecoreRenderingDefinitionBuilder(),
                new SitecorePlaceholderDefinitionBuilder(),
                new SitecoreDeviceDefinitionBuilder(),
                new SitecorePresentationBuilder(),
                new SitecoreFieldBuilder()
            )
        {
        }
    }
}
