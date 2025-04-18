// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using Sitecore.Data;
using Sitecore.Globalization;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreUriBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((ID itemId, Language lang, Version version, Database db) => new ItemUri(itemId, lang, version, db));
            fixture.Register((ItemUri itemUri) => new DataUri(itemUri));
        }
    }
}
