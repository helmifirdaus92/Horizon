// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class BranchTemplateGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldReturnBranchTemplateId([Frozen] IHorizonItemHelper itemHelper, BranchTemplateGraphType sut, TemplateItem templateItem, ID id)
        {
            //arrange
            itemHelper.Configure().GetBranchTemplateId(templateItem).Returns(id);

            // act & assert
            sut.Should().ResolveFieldValueTo("templateId", id, c => c.WithSource(templateItem));
        }
    }
}
