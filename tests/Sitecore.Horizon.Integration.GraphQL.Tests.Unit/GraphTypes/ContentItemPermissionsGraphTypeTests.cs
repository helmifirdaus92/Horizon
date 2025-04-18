// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Security.Accounts;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ContentItemPermissionsGraphTypeTests
    {
        [Theory]
        [InlineAutoNData(true, true)]
        [InlineAutoNData(false, false)]
        internal void ShouldMapSimpleProperties(bool permission, bool permissionExpectedResult,
            [Frozen] IItemPermissionChecker permissionChecker, [Frozen] ISitecoreContext scContext, ContentItemPermissionsGraphType sut, Item item, User user)
        {
            //arrange
            scContext.User = user;
            permissionChecker.CanWrite(item, scContext.User).Returns(permission);
            permissionChecker.CanWriteItemLanguage(item, scContext.User).Returns(permission);
            permissionChecker.CanDelete(item, scContext.User).Returns(permission);
            permissionChecker.CanRename(item, scContext.User).Returns(permission);
            permissionChecker.CanCreate(item, scContext.User).Returns(permission);
            permissionChecker.CanPublish(item, scContext.User).Returns(permission);

            // act & assert
            sut.Should().ResolveFieldValueTo("canWrite", permissionExpectedResult, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canWriteLanguage", permissionExpectedResult, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canDelete", permissionExpectedResult, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canRename", permissionExpectedResult, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canCreate", permissionExpectedResult, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canPublish", permissionExpectedResult, c => c.WithSource(item));
        }
    }
}
