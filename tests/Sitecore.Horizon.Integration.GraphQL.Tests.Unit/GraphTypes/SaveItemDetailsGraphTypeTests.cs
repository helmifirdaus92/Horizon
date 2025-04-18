// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items.Saving;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class SaveItemDetailsGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(SaveItemDetailsGraphType sut, SaveItemDetails saveItemDetails)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("itemId", saveItemDetails.ItemId, c => c.WithSource(saveItemDetails));
            sut.Should().ResolveFieldValueTo("itemVersion", saveItemDetails.ItemVersion, c => c.WithSource(saveItemDetails));
            sut.Should().ResolveFieldValueTo("revision", saveItemDetails.Revision, c => c.WithSource(saveItemDetails));
            sut.Should().ResolveFieldValueTo("fields", saveItemDetails.Fields, c => c.WithSource(saveItemDetails));
            sut.Should().ResolveFieldValueTo("presentationDetails", saveItemDetails.PresentationDetails, c => c.WithSource(saveItemDetails));
        }
    }
}
