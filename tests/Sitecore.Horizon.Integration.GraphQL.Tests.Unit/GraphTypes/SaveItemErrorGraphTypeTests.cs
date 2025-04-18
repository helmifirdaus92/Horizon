// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class SaveItemErrorGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(SaveItemErrorGraphType sut, ID itemId, string errorMessage)
        {
            // arrange
            SaveItemError saveItemError = new(itemId, SaveItemErrorCode.BaseTemplateWasChanged, errorMessage);

            // act & assert
            sut.Should().ResolveFieldValueTo("errorCode", saveItemError.ErrorCode.ToString(), c => c.WithSource(saveItemError));
            sut.Should().ResolveFieldValueTo("message", saveItemError.Message, c => c.WithSource(saveItemError));
            sut.Should().ResolveFieldValueTo("itemId", saveItemError.ItemId, c => c.WithSource(saveItemError));
        }
    }
}
