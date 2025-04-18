// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using Sitecore.Data;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Pipelines.HorizonSaveItem;
using Sitecore.Pipelines.Save;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class SavedItemGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldResolveSimpleProperties(SavedItemGraphType sut, HorizonArgsSaveItem saveItemArgs, ID revisionId)
        {
            // arrange
            var revisionIdString = revisionId.ToString();
            saveItemArgs.Revision = revisionIdString;

            // act & assert
            sut.Should().ResolveFieldValueTo("id", saveItemArgs.ID, c => c.WithSource(saveItemArgs));
            sut.Should().ResolveFieldValueTo("language", saveItemArgs.Language.Name, c => c.WithSource(saveItemArgs));
            sut.Should().ResolveFieldValueTo("version", saveItemArgs.Version.Number, c => c.WithSource(saveItemArgs));
            sut.Should().ResolveFieldValueTo("revision", revisionId, c => c.WithSource(saveItemArgs));
            sut.Should().ResolveFieldValueTo("fields", saveItemArgs.Fields, c => c.WithSource(saveItemArgs));
        }
    }
}
