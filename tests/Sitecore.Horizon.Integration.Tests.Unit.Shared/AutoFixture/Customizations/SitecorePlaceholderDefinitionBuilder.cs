// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using Sitecore.Layouts;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecorePlaceholderDefinitionBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((string key, string metaDataItemId, string uniqueId) => new PlaceholderDefinition()
            {
                Key = key,
                MetaDataItemId = metaDataItemId,
                UniqueId = uniqueId
            });
        }
    }
}
