// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections;
using AutoFixture;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreDeviceDefinitionBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((string id, string layout, PlaceholderDefinition[] deviceDefinitions, RenderingDefinition[] renderingDefinition) => new DeviceDefinition
            {
                ID = id,
                Layout = layout,
                Placeholders = new ArrayList(deviceDefinitions),
                Renderings = new ArrayList(renderingDefinition),
            });
        }
    }
}
