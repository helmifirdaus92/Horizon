// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using FluentAssertions;
using Microsoft.Practices.EnterpriseLibrary.Common.Utility;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ItemInsertOptionGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldImplementInterface(ItemInsertOptionGraphType sut, InsertOptionInterfaceGraphType insertOptionInterfaceGraphType)
        {
            // act & assert
            sut.Interfaces.Should().Contain(typeof(InsertOptionInterfaceGraphType));
            insertOptionInterfaceGraphType.Fields.ForEach(f => sut.Should().HaveField(f.Name, f.Type));
        }

        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties(ItemInsertOptionGraphType sut, TemplateItem templateItemContext)
        {
            // act & assert
            sut.Should().ResolveFieldValueTo("id", templateItemContext.ID, c => c.WithSource(templateItemContext));
            sut.Should().ResolveFieldValueTo("displayName", templateItemContext.DisplayName, c => c.WithSource(templateItemContext));
        }
    }
}
