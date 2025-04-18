// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System.Linq;
using System.Net.Http;
using AutoFixture;

namespace Sitecore.Horizon.Shared.Tests.Unit.Fixtures
{
    public class AutoNDataAttribute : CustomizableAutoDataAttribute
    {
        public AutoNDataAttribute() : base(() =>
        {
            var fixture = new Fixture();

            // Put your customizations here.

            fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
                .ForEach(b => fixture.Behaviors.Remove(b));
            fixture.Behaviors.Add(new OmitOnRecursionBehavior());

            fixture.Customize<HttpClient>(c => c.FromFactory((HttpMessageHandler handler) => new HttpClient(handler)));

            return fixture;
        })
        {
        }
    }
}
