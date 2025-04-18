// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Collections.Generic;
using System.Xml.Linq;
using AutoFixture;
using Sitecore.Layouts;
using Sitecore.Mvc.Extensions;

namespace Sitecore.Horizon.Tests.Unit.Shared.AutoFixture.Customizations
{
    public class SitecoreRenderingDefinitionBuilder : ICustomization
    {
        public void Customize(IFixture fixture)
        {
            fixture.Register((XElement rules, string uniqueId, Dictionary<string, string> parameters) => new RenderingDefinition()
            {
                Rules = rules,
                Parameters = parameters.ToQueryString(),
                UniqueId = uniqueId,
            });
        }
    }
}
