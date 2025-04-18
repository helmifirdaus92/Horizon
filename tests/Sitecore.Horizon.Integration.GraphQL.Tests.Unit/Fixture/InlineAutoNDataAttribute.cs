// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture
{
    internal class InlineAutoNDataAttribute : InlineAutoDataAttribute
    {
        public InlineAutoNDataAttribute(params object[] values) : base(new AutoNDataAttribute(), values)
        {
        }
    }
}
