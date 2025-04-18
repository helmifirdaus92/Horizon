// © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.

using GraphQL.Types;
using Sitecore.Data.Items;
using Sitecore.Diagnostics;
using Sitecore.Horizon.Integration.ExternalProxy;
using Sitecore.Horizon.Integration.Items;

namespace Sitecore.Horizon.Integration.GraphQL.GraphTypes
{
    internal class MediaItemPermissionsGraphType : ObjectGraphType<Item>
    {
        public MediaItemPermissionsGraphType(IItemPermissionChecker permissionChecker, ISitecoreContext scContext)
        {
            Assert.ArgumentNotNull(permissionChecker, nameof(permissionChecker));
            Assert.ArgumentNotNull(scContext, nameof(scContext));

            Name = "MediaItemPermissions";

            Field<NonNullGraphType<BooleanGraphType>>("canCreate", resolve: ctx => permissionChecker.CanCreate(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canDelete", resolve: ctx => permissionChecker.CanDelete(ctx.Source, scContext.User));
            Field<NonNullGraphType<BooleanGraphType>>("canRename", resolve: ctx => permissionChecker.CanRename(ctx.Source, scContext.User));
        }
    }
}
