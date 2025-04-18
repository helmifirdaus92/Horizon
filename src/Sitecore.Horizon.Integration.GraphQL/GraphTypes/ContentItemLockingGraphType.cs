// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class ContentItemLockingGraphType : ObjectGraphType<Item>
    {
        public ContentItemLockingGraphType(IItemPermissionChecker permissionChecker, ISitecoreContext scContext)
        {
            Name = "ContentItemLocking";

            Field<NonNullGraphType<StringGraphType>>("lockedBy", resolve: ctx => ctx.Source.Locking.GetOwner());
            Field<NonNullGraphType<BooleanGraphType>>("lockedByCurrentUser", resolve: ctx => ctx.Source.Locking.HasLock());
            Field<NonNullGraphType<BooleanGraphType>>("canUnlock", resolve: ctx => permissionChecker.CanUnlock(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("isLocked", resolve: ctx => ctx.Source.Locking.IsLocked());
        }
    }
}
