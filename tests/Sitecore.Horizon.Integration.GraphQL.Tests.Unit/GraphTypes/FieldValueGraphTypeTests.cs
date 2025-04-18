// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items.Saving;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class FieldValueGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties(FieldValueGraphType sut, FieldValueInfo fieldValueInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", fieldValueInfo.Id, c => c.WithSource(fieldValueInfo));
            sut.Should().ResolveFieldValueTo("value", fieldValueInfo.Value, c => c.WithSource(fieldValueInfo));
        }
    }
}
