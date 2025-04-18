// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using AutoFixture.Xunit2;
using NSubstitute;
using Sitecore.Data.Items;
using Sitecore.Data.Locking;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.GraphQL.GraphTypes;
using Sitecore.Horizon.Integration.GraphQL.Tests.Unit.Fixture;
using Sitecore.Horizon.Integration.Items;
using Sitecore.Horizon.Tests.Unit.Shared;
using Sitecore.Horizon.Tests.Unit.Shared.Extensions;
using Sitecore.Security.Accounts;
using Xunit;

namespace Sitecore.Horizon.Integration.GraphQL.Tests.Unit.GraphTypes
{
    public class ContentItemLockingGraphTypeTests
    {
        [Theory, AutoNData]
        internal void ShouldMapSimpleProperties([Frozen] IItemPermissionChecker permissionChecker, [Frozen] ISitecoreContext scContext, ContentItemLockingGraphType sut, Item item, ItemLocking itemLocking, User user, string userName)
        {
            //arrange
            scContext.User = user;
            item.AsFake().WithItemLocking();
            item.Locking.HasLock().ReturnsTrue();
            item.Locking.GetOwner().Returns(userName);
            item.Locking.IsLocked().ReturnsTrue();
            permissionChecker.CanUnlock(Any.Item, Arg.Any<User>()).ReturnsTrue();

            // act & assert
            sut.Should().ResolveFieldValueTo("lockedBy", userName, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("lockedByCurrentUser", true, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("canUnlock", true, c => c.WithSource(item));
            sut.Should().ResolveFieldValueTo("isLocked", true, c => c.WithSource(item));
        }
    }
}
