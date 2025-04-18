// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ItemVersionInfoGraphTypeTest
    {
        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties(ItemVersionInfoGraphType sut, ItemVersionInfo itemVersionInfo)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("itemId", itemVersionInfo.ItemId, c => c.WithSource(itemVersionInfo));
            sut.Should().ResolveFieldValueTo("displayName", itemVersionInfo.DisplayName, c => c.WithSource(itemVersionInfo));
            sut.Should().ResolveFieldValueTo("versionNumber", itemVersionInfo.VersionNumber, c => c.WithSource(itemVersionInfo));
        }
    }
}
