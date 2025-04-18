// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using System;
using NSubstitute;
using NSubstitute.Extensions;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ContentItemPublishingGraphTypeTests
    {
        [Theory]
        [InlineAutoNData(false, true, true, true)]
        [InlineAutoNData(true, false, false, false)]
        internal void ShouldMapSimpleProperties(bool neverPublish, bool isPublishable, bool expectedIsPublishable, bool expectedHasPublishableVersion, DateTime expectedValidFrom,
            DateTime expectedValidTo, ContentItemPublishingGraphType sut, Item item, Item validVersion)
        {
            //arrange
            item.AsFake().WithPublishing();

            item.Publishing.NeverPublish.Returns(neverPublish);
            item.Publishing.IsPublishable(Any.Arg<DateTime>(), Any.Bool).Returns(isPublishable);
            item.Publishing.GetValidVersion(Any.Arg<DateTime>(), Any.Bool).Returns(validVersion);
            item.Publishing.ValidFrom.Returns(expectedValidFrom);
            item.Publishing.Configure().ValidTo.Returns(expectedValidTo);


            // act & assert
            sut.Should().ResolveFieldValueTo("isPublishable", expectedIsPublishable, c => c.WithSource(item.Publishing));
            sut.Should().ResolveFieldValueTo("hasPublishableVersion", expectedHasPublishableVersion, c => c.WithSource(item.Publishing));
            sut.Should().ResolveFieldValueTo("validFromDate", expectedValidFrom, c => c.WithSource(item.Publishing));
            sut.Should().ResolveFieldValueTo("validToDate", expectedValidTo, c => c.WithSource(item.Publishing));
        }
    }
}
