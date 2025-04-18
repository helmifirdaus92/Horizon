// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture;
using NSubstitute;
using Sitecore.Data;
using Sitecore.Data.Engines;
using Sitecore.Data.Templates;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreTemplateBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((ID id, string name, TemplateEngine engine) => new Template.Builder(name, id, engine));
            fixture.Register((Template.Builder builder) => builder.Template);
            fixture.Register((Database db) => Substitute.For<TemplateEngine>(db));
        }
    }
}
