// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using FluentAssertions;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class FolderGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldImplementInterface(FolderGraphType sut, ContentInterfaceGraphType contentInterfaceGraphType)
        {
            // act & assert
            sut.Interfaces.Should().Contain(typeof(ContentInterfaceGraphType));
            contentInterfaceGraphType.Fields.ForEach(f => sut.Should().HaveField(f.Name, f.Type));
        }

        [Theory, AutoNData]
        internal void FolderGraphType_ShouldMapSimpleProperties([Frozen] IHorizonItemHelper horizonItemHelper, FolderGraphType sut, Item item, ID templateId)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("isFolder", true, c => c.WithSource(item));
        }
    }
}
