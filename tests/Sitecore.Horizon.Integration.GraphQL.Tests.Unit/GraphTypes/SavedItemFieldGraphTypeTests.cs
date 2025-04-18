// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Pipelines.Save;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class SavedItemFieldGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(SavedItemFieldGraphType sut, HorizonArgsSaveField saveField)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", saveField.ID, c => c.WithSource(saveField));
            sut.Should().ResolveFieldValueTo("value", saveField.Value, c => c.WithSource(saveField));
            sut.Should().ResolveFieldValueTo("originalValue", saveField.OriginalValue, c => c.WithSource(saveField));
            sut.Should().ResolveFieldValueTo("reset", saveField.Reset, c => c.WithSource(saveField));
        }
    }
}
