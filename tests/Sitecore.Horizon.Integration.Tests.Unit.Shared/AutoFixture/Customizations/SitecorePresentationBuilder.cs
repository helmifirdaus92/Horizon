// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections;
using AutoFixture;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecorePresentationBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((DeviceDefinition[] deviceDefinitions) => new LayoutDefinition
            {
                Devices = new ArrayList(deviceDefinitions)
            });
        }
    }
}
